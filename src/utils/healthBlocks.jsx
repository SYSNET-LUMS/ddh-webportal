import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export const initHealthBlocks = () => {
    // --- BLOCK DEFINITIONS ---
    Blockly.common.defineBlocksWithJsonArray([
        // getSensor(modality, last_n_samples, processed=mean)
        {
            "type": "get_sensor",
            "message0": "get sensor %1 | last %2 seconds | aggregate %3",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "MODALITY",
                    "options": [
                        ["Heart Rate", "hr"],
                        ["SpO2", "spo2"],
                        ["Steps", "steps"],
                        ["Location", "location"],
                        ["Linear Acceleration", "linear_accel"],
                        ["Gyroscope", "gyro"],
                        ["Stillness", "stillness"]
                    ]
                },
                {
                    "type": "field_number",
                    "name": "SECONDS",
                    "value": 3,
                    "min": 1
                },
                {
                    "type": "field_dropdown",
                    "name": "PROC",
                    "options": [
                        ["mean", "mean"],
                        ["max", "max"],
                        ["min", "min"],
                        ["variance", "variance"],
                        ["none", "none"]
                    ]
                }
            ],
            "output": "Number",
            "colour": "#e53935"
        },
        // Processing Functions
        { "type": "get_activity", "message0": "get current activity", "output": "String", "colour": "#43a047" },
        { "type": "get_steps", "message0": "get step count", "output": "Number", "colour": "#43a047" },
        { "type": "get_stress", "message0": "get stress level", "output": "Number", "colour": "#43a047" },
        // Action: WhatsApp
        {
            "type": "send_whatsapp",
            "message0": "Send WhatsApp %1 to %2",
            "args0": [
                { "type": "input_value", "name": "MSG", "check": "String" },
                { "type": "input_value", "name": "PHONE", "check": "String" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#25D366"
        },
        // Action: AI
        {
            "type": "ask_ai",
            "message0": "Ask AI: %1",
            "args0": [{ "type": "input_value", "name": "PROMPT", "check": "String" }],
            "output": "String",
            "colour": "#8e44ad"
        },
        // Addistions 
        {
            "type": "fall_detected_window",
            "message0": "fall detected in last %1 seconds",
            "args0": [
                { "type": "field_number", "name": "SECONDS", "value": 3, "min": 1, "max": 10, "precision": 1 }
            ],
            "output": "Boolean",
            "colour": "#8e44ad",
            "tooltip": "Detects a fall using linear acceleration and gyroscope over a recent time window."
        },
        {
            "type": "fall_detected_advanced",
            "message0": "detect fall in last %1 s | sensitivity %2",
            "args0": [
                { "type": "field_number", "name": "SECONDS", "value": 3, "min": 1, "max": 10, "precision": 1 },
                {
                    "type": "field_dropdown",
                    "name": "SENSITIVITY",
                    "options": [
                        ["low", "low"],
                        ["medium", "medium"],
                        ["high", "high"]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": "#8e44ad",
            "tooltip": "Detects a fall using built-in thresholds and motion features."
        },

        {
            "type": "send_fall_alert",
            "message0": "send fall alert to %1 with message %2",
            "args0": [
                { "type": "input_value", "name": "PHONE", "check": "String" },
                { "type": "input_value", "name": "MSG", "check": "String" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#ff7043"
        },
        // --- UI/DASHBOARD BLOCKS ---
        // --- DASHBOARD BLOCKS ---
        {
            "type": "show_data",
            "message0": "show data on portal %1 in %2 view",
            "args0": [
                { "type": "input_value", "name": "DATA" },
                { "type": "field_dropdown", "name": "VIEW", "options": [["plot", "plot"], ["text", "text"], ["metric", "metric"]] }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#3f51b5",
            "tooltip": "Display data on the dashboard using the selected view type."
        }
    ]);

    // --- COMPLETE GENERATORS ---

    // Sensor Data Generator
    javascriptGenerator.forBlock['get_sensor'] = function (block) {
        const modality = block.getFieldValue('MODALITY');
        const seconds = Number(block.getFieldValue('SECONDS')) || 3;
        const proc = block.getFieldValue('PROC');
        const code = `await getSensor('${modality}', ${seconds}, '${proc}')`;
        return [code, Order.AWAIT];
    };

    // Processing Functions
    javascriptGenerator.forBlock['get_activity'] = () => [`await getActivity()`, Order.AWAIT];
    javascriptGenerator.forBlock['get_steps'] = () => [`await getSteps()`, Order.AWAIT];
    javascriptGenerator.forBlock['get_stress'] = () => [`await getStress()`, Order.AWAIT];

    // WhatsApp Notification Generator
    javascriptGenerator.forBlock['send_whatsapp'] = function (block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Order.NONE) || "''";
        const phone = generator.valueToCode(block, 'PHONE', Order.NONE) || "''";
        return `await sendNotificationWhatsApp(${msg}, ${phone});\n`;
    };

    // Email Notification Generator
    javascriptGenerator.forBlock['send_email'] = function (block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Order.NONE) || "''";
        const address = generator.valueToCode(block, 'ADDR', Order.NONE) || "''";
        return `await sendNotificationEmail(${msg}, ${address});\n`;
    };

    // AI Assistant Generator
    javascriptGenerator.forBlock['ask_ai'] = function (block, generator) {
        const prompt = generator.valueToCode(block, 'PROMPT', Order.NONE) || "''";
        const code = `await askAI(${prompt})`;
        return [code, Order.AWAIT];
    };

    javascriptGenerator.forBlock['fall_detected_window'] = function (block) {
        const seconds = Number(block.getFieldValue('SECONDS')) || 3;
        const code = `await detectFallWindow(${seconds})`;
        return [code, Order.AWAIT];
    };

    javascriptGenerator.forBlock['fall_detected_advanced'] = function (block) {
        const seconds = Number(block.getFieldValue('SECONDS')) || 3;
        const sensitivity = block.getFieldValue('SENSITIVITY') || 'medium';
        const code = `await detectFallWindow(${seconds}, '${sensitivity}')`;
        return [code, Order.AWAIT];
    };



    javascriptGenerator.forBlock['send_fall_alert'] = function (block, generator) {
        const phone = generator.valueToCode(block, 'PHONE', Order.NONE) || "''";
        const msg = generator.valueToCode(block, 'MSG', Order.NONE) || "'Possible fall detected'";
        return `await sendFallAlert(${phone}, ${msg});\n`;
    };

    // Dashboard Generator
    javascriptGenerator.forBlock['show_data'] = function (block, generator) {
        const data = generator.valueToCode(block, 'DATA', Order.NONE) || "''";
        const view = block.getFieldValue('VIEW');
        return `await showData(${data}, '${view}');\n`;
    };
};