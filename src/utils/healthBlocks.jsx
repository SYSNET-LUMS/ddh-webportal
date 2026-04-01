import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export const initHealthBlocks = () => {
    // --- BLOCK DEFINITIONS ---
    Blockly.common.defineBlocksWithJsonArray([
        // getSensor(modality, last_n_samples, processed=mean)
        {
            "type": "get_sensor",
            "message0": "get sensor %1 | samples: %2 | aggregate: %3",
            "args0": [
                { "type": "field_dropdown", "name": "MODALITY", "options": [["Heart Rate", "hr"], ["SpO2", "spo2"], ["Steps", "steps"]] },
                { "type": "field_number", "name": "N", "value": 10 },
                { "type": "field_dropdown", "name": "PROC", "options": [["mean", "mean"], ["max", "max"], ["min", "min"]] }
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
        }
    ]);

    // --- COMPLETE GENERATORS ---

    // Sensor Data Generator
    javascriptGenerator.forBlock['get_sensor'] = function (block) {
        const modality = block.getFieldValue('MODALITY');
        const n = block.getFieldValue('N');
        const proc = block.getFieldValue('PROC');
        const code = `await getSensor('${modality}', ${n}, '${proc}')`;
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
};