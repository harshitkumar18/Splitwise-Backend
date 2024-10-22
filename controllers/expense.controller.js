import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.models.js";
import {Group} from "../models/group.models.js";
import {User} from "../models/user.models.js";

export const createGroup = asyncHandler(async (req, res) => {
    const { groupName, memberIds } = req.body;

    try {
        // Validate the input
        if (!groupName || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            throw new ApiError(400, "Group name and at least one member must be provided");
        }

        // Validate all members (ensure they exist)
        const members = await User.find({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length) {
            throw new ApiError(404, "Some users do not exist");
        }

        // Check if the group name already exists
        const existingGroup = await Group.findOne({ name: groupName });
        if (existingGroup) {
            throw new ApiError(409, `Group with name "${groupName}" already exists`);
        }

        // Create the group
        const group = new Group({
            name: groupName,
            members: memberIds.map(userId => ({ userId })),
        });

        // Save the group to the database
        await group.save();

        // Respond with success
        res.status(201).json(new ApiResponse(201, group, "Group created successfully"));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }
        res.status(500).json(new ApiResponse(500, null, "An unexpected error occurred"));
    }
});
// Create a new expense and split it among group members
export const addExpenseToGroup = asyncHandler(async (req, res) => {
    const { groupId, amount, description, splitMethod, exactAmounts = [], percentages = [] } = req.body;

    try {
        // Find the group
        const group = await Group.findById(groupId).populate('members.userId');
        if (!group) return res.status(404).json(new ApiResponse(404, null, "Group not found"));

        // Initialize participants
        let participants = group.members.map(member => ({
            userId: member.userId._id,
            amountOwed: 0,
            percentage: 0,
        }));

        // Calculate amounts owed and percentages based on the split method
        if (splitMethod === 'equal') {
            const amountPerParticipant = amount / participants.length;
            participants = participants.map(participant => ({
                ...participant,
                amountOwed: amountPerParticipant,
                percentage: 100 / participants.length,
            }));
        } else if (splitMethod === 'exact') {
            if (exactAmounts.length !== participants.length) {
                return res.status(400).json(new ApiResponse(400, null, "Exact amounts must match the number of participants"));
            }
            participants = participants.map((participant, index) => ({
                ...participant,
                amountOwed: exactAmounts[index],
                percentage: (exactAmounts[index] / amount) * 100,
            }));
        } else if (splitMethod === 'percentage') {
            const totalPercentage = percentages.reduce((sum, percentage) => sum + percentage, 0);
            if (totalPercentage !== 100) {
                return res.status(400).json(new ApiResponse(400, null, "Total percentages must equal 100%"));
            }
            participants = participants.map((participant, index) => ({
                ...participant,
                amountOwed: (amount * percentages[index]) / 100,
                percentage: percentages[index],
            }));
        } else {
            return res.status(400).json(new ApiResponse(400, null, "Invalid split method"));
        }

        // Create the new expense
        const newExpense = await Expense.create({
            groupId,
            amount,
            description,
            participants,
        });

        res.status(201).json(new ApiResponse(201, newExpense, "Expense added successfully"));
    } catch (error) {
        res.status(400).json(new ApiResponse(400, null, error.message));
    }
});

export const  getUserExpenses= asyncHandler(async (req, res) => {
    // const user = await User.findById(req.user._id)
    

    try {
        const expenses = await Expense.find({
            "participants.userId": req.user._id,
        }).populate('groupId');

        res.status(200).json(new ApiResponse(200, expenses, "User expenses fetched successfully"));
    } catch (error) {
        res.status(400).json(new ApiResponse(400, null, error.message));
    }
  });

// Retrieve individual user expenses
// export const getUserExpenses = asyncHandler(async (req, res) => {

   
// });

// Retrieve overall expenses for a group

// export const getUserExpenses = asyncHandler(async (req, res) => {
//     return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
//   });
export const getGroupExpenses = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    try {
        const expenses = await Expense.find({ groupId }).populate('participants.userId');

        res.status(200).json(new ApiResponse(200, expenses, "Group expenses fetched successfully"));
    } catch (error) {
        res.status(400).json(new ApiResponse(400, null, error.message));
    }
});

// Generate a balance sheet for the group
export const generateBalanceSheet = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    try {
        const expenses = await Expense.find({ groupId });
        const balanceSheet = {};

        expenses.forEach(expense => {
            expense.participants.forEach(participant => {
                const userId = participant.userId.toString();
                if (!balanceSheet[userId]) {
                    balanceSheet[userId] = 0;
                }
                balanceSheet[userId] += participant.amountOwed;
            });
        });

        res.status(200).json(new ApiResponse(200, balanceSheet, "Balance sheet generated successfully"));
    } catch (error) {
        res.status(400).json(new ApiResponse(400, null, error.message));
    }
});
