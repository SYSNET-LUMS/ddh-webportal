import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript'; // Import the generator
import { initHealthBlocks } from '../utils/healthBlocks';
import 'blockly/blocks'; // Standard blocks
import 'blockly/javascript'; // JS Generator
import '../App.css';
import '../styles/HomeAssignments.css';

export default function HomeAssignments() {
    const navigate = useNavigate();
    const [xml, setXml] = useState(''); // Stores the current state of blocks
    const [javascriptCode, setJavascriptCode] = useState('');

    // Initialize custom blocks
    initHealthBlocks();

    // Define the categories and blocks for the student toolbox
    const initialToolbox = {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: 'Logic',
                colour: '#5C81A6',
                contents: [{ kind: 'block', type: 'controls_if' }],
            },
            {
                kind: 'category',
                name: 'Loops',
                colour: '#5CA65C',
                contents: [{ kind: 'block', type: 'controls_whileUntil' }],
            },
            {
                kind: 'category',
                name: 'Text',
                colour: '#5CA68E',
                contents: [{ kind: 'block', type: 'text' }, { kind: 'block', type: 'text_print' }],
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
                    { kind: 'block', type: 'send_whatsapp' },
                    { kind: 'block', type: 'ask_ai' }
                ]
            }
        ],
    };

    const onWorkspaceChange = (workspace) => {
        // Generate JavaScript code from the blocks in the workspace
        const code = javascriptGenerator.workspaceToCode(workspace);
        setJavascriptCode(code);
    };

    // // 1. Fetch the list of saved items
    // useEffect(() => {
    //     if (user) {
    //         fetch(`/api/snippets/${user.id}`)
    //             .then(res => res.json())
    //             .then(data => setSavedSnippets(data.snippets || []));
    //     }
    // }, [user]);

    // // 2. Save current blocks as a new named snippet
    // const saveSnippet = async () => {
    //     if (!snippetName) return alert("Enter a name for this function");

    //     // Save only the blocks currently in the workspace
    //     const state = Blockly.serialization.workspaces.save(workspaceRef.current);

    //     await fetch('/api/snippets/save', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             clerkId: user.id,
    //             name: snippetName,
    //             blockData: state
    //         })
    //     });
    //     // Refresh list
    //     setSnippetName("");
    // };

    // // 3. The "Magic" Function: Add to existing workspace without wiping
    // const injectSnippet = (blockData) => {
    //     if (workspaceRef.current) {
    //         // .load() on a workspace level usually wipes it. 
    //         // To APPEND, we iterate through the saved blocks.
    //         Blockly.serialization.workspaces.load(blockData, workspaceRef.current, { recordUndo: true });
    //         // Note: Blockly automatically handles ID collisions to prevent interference.
    //     }
    // };

    return (
        <div className="assignment-container">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="assignment-workspace">
                {/* Main Blockly Panel */}
                <div className="panel blockly-panel" style={{ position: 'relative' }}>
                    <BlocklyWorkspace
                        className="blockly-editor-fill" // Use CSS to make it fill the panel
                        toolboxConfiguration={initialToolbox}
                        initialXml={xml}
                        onXmlChange={setXml}
                        onWorkspaceChange={onWorkspaceChange}
                        workspaceConfiguration={{
                            grid: { spacing: 20, length: 30, colour: '#ccc', snap: true },
                        }}
                    />
                </div>

                <div className="side-column">
                    <div className="panel output-panel">
                        <div className="panel-label">Output</div>
                        {/* Display the generated code here */}
                        <pre className="code-display">
                            {javascriptCode || "// Drag blocks to see code output"}
                        </pre>
                    </div>
                    <div className="panel saved-panel">
                        <div className="panel-label">Saved Files/Function</div>
                        {/* <button onClick={saveProject}>Save</button>
                        <button onClick={loadProject}>Load</button> */}
                    </div>
                </div>
            </div>
        </div >
    );
}