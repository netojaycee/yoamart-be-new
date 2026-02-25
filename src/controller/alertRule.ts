// @ts-nocheck
import { RequestHandler } from "express";
import AlertRule from "#/model/alertRule";
import mongoose from "mongoose";

export const createAlertRule: RequestHandler = async (req, res) => {
    const { ruleName, daysBeforeExpiry, active = true } = req.body;

    if (!ruleName || daysBeforeExpiry === undefined) {
        return res.status(400).json({ message: "ruleName and daysBeforeExpiry are required!" });
    }

    if (daysBeforeExpiry < 0) {
        return res.status(400).json({ message: "daysBeforeExpiry must be a positive number!" });
    }

    // Check if rule already exists
    const existingRule = await AlertRule.findOne({ ruleName });
    if (existingRule) {
        return res.status(400).json({ message: "Alert rule with this name already exists!" });
    }

    const rule = new AlertRule({
        ruleName,
        daysBeforeExpiry,
        active,
    });

    await rule.save();
    res.json({ rule });
};

export const getAlertRules: RequestHandler = async (req, res) => {
    const { active } = req.query;

    const query: any = {};

    if (active === "true") {
        query.active = true;
    } else if (active === "false") {
        query.active = false;
    }

    const rules = await AlertRule.find(query).sort({ daysBeforeExpiry: 1 });

    res.json({ rules, count: rules.length });
};

export const getAlertRuleById: RequestHandler = async (req, res) => {
    const { ruleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return res.status(400).json({ message: "Invalid rule ID!" });
    }

    const rule = await AlertRule.findById(ruleId);
    if (!rule) return res.status(400).json({ message: "Alert rule not found!" });

    res.json({ rule });
};

export const updateAlertRule: RequestHandler = async (req, res) => {
    const { ruleId } = req.params;
    const { ruleName, daysBeforeExpiry, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return res.status(400).json({ message: "Invalid rule ID!" });
    }

    if (daysBeforeExpiry !== undefined && daysBeforeExpiry < 0) {
        return res.status(400).json({ message: "daysBeforeExpiry must be a positive number!" });
    }

    const updateData: any = {};
    if (ruleName !== undefined) updateData.ruleName = ruleName;
    if (daysBeforeExpiry !== undefined) updateData.daysBeforeExpiry = daysBeforeExpiry;
    if (active !== undefined) updateData.active = active;

    const rule = await AlertRule.findByIdAndUpdate(ruleId, updateData, { new: true });
    if (!rule) return res.status(400).json({ message: "Alert rule not found!" });

    res.json({ rule });
};

export const deleteAlertRule: RequestHandler = async (req, res) => {
    const { ruleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return res.status(400).json({ message: "Invalid rule ID!" });
    }

    const rule = await AlertRule.findByIdAndDelete(ruleId);
    if (!rule) return res.status(400).json({ message: "Alert rule not found!" });

    res.json({ message: "Alert rule deleted successfully!" });
};

export const getDefaultAlertRule: RequestHandler = async (req, res) => {
    // Get the first active rule (or create a default one)
    let rule = await AlertRule.findOne({ active: true });

    if (!rule) {
        // Create default rule if none exists
        rule = new AlertRule({
            ruleName: "Default",
            daysBeforeExpiry: 3,
            active: true,
        });
        await rule.save();
    }

    res.json({ rule });
};
