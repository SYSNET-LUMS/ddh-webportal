import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { initHealthBlocks } from '../../utils/healthBlocks';
import 'blockly/blocks';
import 'blockly/javascript';
import BlocklyEditor from '../../components/BlocklyEditor';
import ResizableSplitLayout from '../../components/ResizableSplitLayout';
import '../../styles/AssignmentCards.css';

// Using some images from A0 as placeholders or if they are relevant
import appStoreImg from '../../assets/assignments/SensorLogger_AppStore.jpeg';
import playStoreImg from '../../assets/assignments/SensorLogger_PlayStore.jpeg';
import sensorsPage from '../../assets/assignments/SensorLogger_Sensors.jpeg';

/* ─── Backend ──────────────────────────────────────────────────── */

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

/**
 * Naming convention: <username>_A1_P<partIndex>_C<cardIndex>.<ext>
 */
function buildFileName(username, partIndex, cardIndex, originalFile) {
    const ext = originalFile.name.split('.').pop().toLowerCase();
    const safeName = (username ?? 'student').replace(/[^a-zA-Z0-9._-]/g, '.');
    return `${safeName}_A1_P${partIndex}_C${cardIndex}.${ext}`;
}

async function uploadToMinio(file, key) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'class-data');
    formData.append('key', key);

    const res = await fetch(`${BACKEND}/api/minio/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => `Server error ${res.status}`);
        throw new Error(msg);
    }
    return res.json();
}

/* ─── Assignment Data ──────────────────────────────────────────── */

const PARTS = [
    {
        label: 'Part 1',
        title: 'Assignment 1 Overview',
        preamble: 'This assignment introduces more advanced sensor data collection and analysis techniques.',
        cards: [
            {
                id: '1-1',
                title: 'Getting Started',
                body: 'Welcome to Assignment 1. Ensure you have your mobile device ready with the Sensor Logger app.',
            },
            {
                id: '1-2',
                title: 'Data Collection Setup',
                body: 'Please upload a screenshot showing your device is ready for data collection.',
                upload: true
            },
        ],
    },
    {
        label: 'Part 2',
        title: 'Blockly Integration',
        preamble: 'Use the Blockly editor on the right to complete the tasks.',
        cards: [
            {
                id: '2-1',
                title: 'Create a simple logic',
                body: 'Drag an **if block** and a **compare block** to the workspace.',
            },
        ],
    },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

function totalCards(parts) {
    return parts.reduce((sum, p) => sum + p.cards.length, 0);
}

function formatBody(text) {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

/* ─── Sub-components ───────────────────────────────────────────── */

function Checkmark() {
    return (
        <svg className="checkmark" viewBox="0 0 12 12">
            <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
        </svg>
    );
}

function UploadZone({ partIndex, cardIndex, username }) {
    const inputRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [uploadedName, setUploadedName] = useState('');
    const [dragover, setDragover] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        const renamedFile = buildFileName(username, partIndex, cardIndex, file);
        const safeUsername = (username ?? 'student').replace(/[^a-zA-Z0-9._-]/g, '.');
        const key = `home-assignments/assignment-1/${safeUsername}/${renamedFile}`;

        setStatus('uploading');
        setStatusMsg('Uploading…');
        setUploadedName(renamedFile);
        try {
            await uploadToMinio(file, key);
            setStatus('done');
            setStatusMsg('Upload successful!');
        } catch (err) {
            setStatus('error');
            setStatusMsg(err.message ?? 'Upload failed. Please try again.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragover(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div
            className={`card-upload-zone ${dragover ? 'dragover' : ''} ${status === 'uploading' ? 'uploading' : ''} ${status === 'done' ? 'upload-done' : ''} ${status === 'error' ? 'upload-error' : ''}`}
            onClick={() => status !== 'uploading' && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            id={`upload-P${partIndex}-C${cardIndex}`}
        >
            <input
                ref={inputRef}
                type="file"
                hidden
                onChange={e => handleFile(e.target.files?.[0])}
            />
            <div className="upload-icon">
                {status === 'done' ? '✅' : status === 'error' ? '❌' : status === 'uploading' ? '⏳' : '📎'}
            </div>
            <p className="upload-text">
                {status === 'idle' && 'Click or drag a file to upload'}
                {status === 'uploading' && 'Uploading…'}
                {status === 'done' && 'File uploaded — click to replace'}
                {status === 'error' && 'Upload failed — click to retry'}
            </p>
            {statusMsg && (
                <p className={`upload-status ${status === 'done' ? 'success' : status === 'error' ? 'error' : 'loading'}`}>
                    {statusMsg}
                </p>
            )}
            {uploadedName && (
                <p className="upload-filename">{uploadedName}</p>
            )}
        </div>
    );
}

function AssignmentCard({ card, partIndex, cardIndex, checked, onToggle, username }) {
    return (
        <div className={`assignment-card ${checked ? 'completed' : ''}`}>
            <div className="card-gutter">
                <span className="card-number">{String(cardIndex + 1).padStart(2, '0')}</span>
                <button
                    className={`card-checkbox ${checked ? 'checked' : ''}`}
                    onClick={onToggle}
                    aria-label={checked ? 'Mark as incomplete' : 'Mark as done'}
                    id={`checkbox-P${partIndex}-C${cardIndex}`}
                >
                    <Checkmark />
                </button>
            </div>

            <div className="card-content">
                <h2 className="card-title">{card.title}</h2>
                {card.body && <p className="card-body">{formatBody(card.body)}</p>}
                {card.image && <img src={card.image} alt={card.title} className="card-image" />}
                {card.upload && <UploadZone partIndex={partIndex} cardIndex={cardIndex} username={username} />}
            </div>
        </div>
    );
}

function AssignmentIntro() {
    return (
        <section className="assignment-intro">
            <p>
                Welcome to <strong>Assignment 1</strong>. Use the instructions on the left and the Blockly editor on the right.
            </p>
        </section>
    );
}

function AssignmentPart({ part, partIndex, checked, onToggle, username }) {
    return (
        <section className="assignment-part">
            <div className="assignment-part-header">
                <p className="assignment-part-label">{part.label}</p>
                <h2 className="assignment-part-title">{part.title}</h2>
                {part.preamble && <p className="assignment-part-preamble">{part.preamble}</p>}
            </div>

            <div className="assignment-cards-stack">
                {part.cards.map((card, cardIdx) => (
                    <AssignmentCard
                        key={card.id}
                        card={card}
                        partIndex={partIndex}
                        cardIndex={cardIdx}
                        checked={!!checked[card.id]}
                        onToggle={() => onToggle(card.id)}
                        username={username}
                    />
                ))}
            </div>
        </section>
    );
}

export default function Assignment1() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [checked, setChecked] = useState({});
    const [xml, setXml] = useState('');
    const [javascriptCode, setJavascriptCode] = useState('');

    const username = user?.username ?? user?.firstName ?? 'student';
    const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

    const total = totalCards(PARTS);
    const done = Object.values(checked).filter(Boolean).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="assignment-page split-view">
            <header className="assignment-page-header">
                <button
                    className="assignment-back-btn"
                    onClick={() => navigate('/home-assignments')}
                    id="assignment1-back-btn"
                >
                    ← Back
                </button>
                <h1 className="assignment-page-title">Assignment 1 - Fall Detection</h1>
                <div className="assignment-progress-info">
                    <span className="assignment-progress-summary">{done} / {total} done</span>
                    <div className="assignment-progress-bar-wrapper">
                        <div className="assignment-progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </header>

            <ResizableSplitLayout
                leftContent={
                    <main className="assignment-page-body left-panel-content">
                        <AssignmentIntro />

                        {PARTS.map((part, idx) => (
                            <AssignmentPart
                                key={idx}
                                part={part}
                                partIndex={idx + 1}
                                checked={checked}
                                onToggle={toggle}
                                username={username}
                            />
                        ))}
                    </main>
                }
                rightContent={
                    <BlocklyEditor
                        initialXml={xml}
                        onXmlChange={setXml}
                        onCodeChange={setJavascriptCode}
                        storageKey="assignment-1-blocks"
                    />
                }
            />
        </div>
    );
}
