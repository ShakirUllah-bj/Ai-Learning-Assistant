import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { ChunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      // Delete the uploaded file if title is missing
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a title for the document",
        statusCode: 400,
      });
    }

    // Construct the URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document record in the database
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileUrl,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process the PDF in the background {in production, use a queue like Bull}
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error: ", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in background.",
      statusCode: 201,
    });
    console.log("Document uploaded: ", document._id);
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    // Create text chunks
    const chunks = ChunkText(text, 500, 50); // Adjust chunk size as needed

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}: `, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSet",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSet" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSet: 0,
          quizzes: 0,
        },
      },

      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID format",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: req.user._id,
    });

    console.log("User ID from Request:", req.user?._id);
    console.log("Document ID from Request:", req.params?.id);
    console.log("Document found:", !!document);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    // Update last accessed date
    document.lastAccessed = new Date();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    console.error("Error in getDocument:", error.message);
    next(error);
  }
};

// @desc    delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID format",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Delete file from filesystem
    const localFilePath = document.filePath?.startsWith("http")
      ? path.join(
          process.cwd(),
          "uploads",
          "documents",
          path.basename(document.filePath),
        )
      : document.filePath;
    await fs.unlink(localFilePath).catch(() => {});

    // Delete document record
    await Document.deleteOne({ _id: document._id });

    // Delete document's flashcards and quizzes
    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });

    return res.status(200).json({
      success: true,
      message:
        "Document and associated flashcards/quizzes deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteDocument:", error.message);
    next(error);
  }
};
