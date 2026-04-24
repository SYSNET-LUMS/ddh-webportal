import React, { useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { initHealthBlocks } from '../utils/healthBlocks';
import 'blockly/blocks';
import 'blockly/javascript';

// Initialize custom blocks once
initHealthBlocks();

const customTheme = Blockly.Theme.defineTheme('customTheme', {
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: '#ffffff',
        toolboxBackgroundColour: '#f0ede8',
        toolboxForegroundColour: '#1a1a1a',
        flyoutBackgroundColour: '#e2ddd8',
        flyoutForegroundColour: '#1a1a1a',
        scrollbarColour: '#cccccc',
        insertionMarkerColour: '#a56c1f',
        insertionMarkerOpacity: 0.3,
    },
});

const DEFAULT_TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Logic',
            colour: '#5C81A6',
            contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_negate' },
                { kind: 'block', type: 'logic_boolean' },
                { kind: 'block', type: 'logic_null' }
            ],
        },
        {
            kind: 'category',
            name: 'Math',
            colour: '#5C68A6',
            contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_constant' }
            ],
        },
        {
            kind: 'category',
            name: 'Loops',
            colour: '#5CA65C',
            contents: [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'controls_whileUntil' },
                { kind: 'block', type: 'controls_for' }
            ],
        },
        {
            kind: 'category',
            name: 'Text',
            colour: '#5CA68E',
            contents: [
                { kind: 'block', type: 'text' },
                { kind: 'block', type: 'text_join' },
                { kind: 'block', type: 'text_append' },
                { kind: 'block', type: 'text_length' },
                { kind: 'block', type: 'text_isEmpty' },
                { kind: 'block', type: 'text_print' }
            ],
        },
        { kind: 'category', name: 'Variables', custom: 'VARIABLE', colour: '#A55B80' },
        { kind: 'category', name: 'Functions', custom: 'PROCEDURE', colour: '#995BA5' },
        {
            kind: 'category',
            name: 'IoT Health',
            colour: '#e53935',
            contents: [
                { kind: 'block', type: 'get_sensor' },
                { kind: 'block', type: 'get_activity' },
                { kind: 'block', type: 'send_fall_alert' },
                { kind: 'block', type: 'send_whatsapp' },
                { kind: 'block', type: 'ask_ai' }
            ]
        },
        {
            kind: 'category',
            name: 'Models',
            colour: '#8e44ad',
            contents: [
                { kind: 'block', type: 'fall_detected_window' },
                { kind: 'block', type: 'fall_detected_advanced' }
            ]
        },
        {
            kind: 'category',
            name: 'Dashboard',
            colour: '#3f51b5',
            contents: [
                { kind: 'block', type: 'show_data' }
            ]
        }
    ],
};

const STORAGE_KEY_DEFAULT = 'blockly-workspace-xml';

export default function BlocklyEditor({
    initialXml = '',
    onXmlChange,
    onCodeChange,
    storageKey = STORAGE_KEY_DEFAULT,
    toolboxConfiguration = DEFAULT_TOOLBOX
}) {
    const [javascriptCode, setJavascriptCode] = useState('');

    // Load persisted XML or use the initialXml prop
    const [persistedXml] = useState(() => {
        try {
            return localStorage.getItem(storageKey) || initialXml;
        } catch (e) {
            console.error('Failed to load from localStorage', e);
            return initialXml;
        }
    });

    const handleWorkspaceChange = (workspace) => {
        const code = javascriptGenerator.workspaceToCode(workspace);
        setJavascriptCode(code);
        if (onCodeChange) onCodeChange(code);
    };

    const handleXmlChange = (newXml) => {
        try {
            localStorage.setItem(storageKey, newXml);
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
        if (onXmlChange) onXmlChange(newXml);
    };

    return (
        <aside className="right-panel blockly-container">
            <div className="blockly-editor-wrapper">
                <BlocklyWorkspace
                    className="blockly-editor-fill"
                    toolboxConfiguration={toolboxConfiguration}
                    initialXml={persistedXml}
                    onXmlChange={handleXmlChange}
                    onWorkspaceChange={handleWorkspaceChange}
                    workspaceConfiguration={{
                        grid: { spacing: 20, length: 30, colour: '#ccc', snap: true },
                        theme: customTheme,
                    }}
                />
            </div>
            <div className="code-output-overlay">
                <div className="panel-label">Generated Code</div>
                <pre className="code-display">
                    {javascriptCode || "// Drag blocks to see code output"}
                </pre>
            </div>
        </aside>
    );
}
