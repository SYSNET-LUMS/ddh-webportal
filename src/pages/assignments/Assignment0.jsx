import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import '../../styles/AssignmentCards.css';

import appStoreImg from '../../assets/assignments/SensorLogger_AppStore.jpeg';
import playStoreImg from '../../assets/assignments/SensorLogger_PlayStore.jpeg';
import sensorsPage from '../../assets/assignments/SensorLogger_Sensors.jpeg';
import studyImg1 from '../../assets/assignments/SensorLogger_Study1.jpg';
import studyImg2 from '../../assets/assignments/SensorLogger_Study2.jpg';
import studyImg3 from '../../assets/assignments/SensorLogger_Study3.jpg';
import studyImg4 from '../../assets/assignments/SensorLogger_Study4.jpg';
import studyImg5 from '../../assets/assignments/SensorLogger_Study5.jpg';
import recordingImg1 from '../../assets/assignments/SensorLogger_Recording1.jpg';
import recordingImg2 from '../../assets/assignments/SensorLogger_Recording2.jpg';
import recordingImg3 from '../../assets/assignments/SensorLogger_Recording3.jpg';
import recordingImg4 from '../../assets/assignments/SensorLogger_Recording4.jpg';
import understadningImg from '../../assets/assignments/Understanding_part5.jpg';
// import

/* ─── Backend ──────────────────────────────────────────────────── */

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
    ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
    : '';

/**
 * Naming convention: <username>_A0_P<partIndex>_C<cardIndex>.<ext>
 * e.g.  john.doe_A0_P1_C2.pdf
 */
function buildFileName(username, partIndex, cardIndex, originalFile) {
    const ext = originalFile.name.split('.').pop().toLowerCase();
    const safeName = (username ?? 'student').replace(/[^a-zA-Z0-9._-]/g, '.');
    return `${safeName}_A0_P${partIndex}_C${cardIndex}.${ext}`;
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

/**
 * Each part has: { label, title, preamble, cards[] }
 * Each card has:  { id, title, body?, code?, hint?, image?, upload? }
 *   image: string (url or imported asset)
 *   upload: true  → shows a file-upload zone
 */
const PARTS = [
    {
        label: 'Part 1',
        title: 'Set Up and Explore the Sensor Logger App',
        preamble: 'In this part, you will install the Sensor Logger app, grant the required permissions, and explore the available sensors on your device.',
        cards: [
            {
                id: '1-1',
                title: 'Install the app',
                body: 'Install the Sensor Logger app on your phone.\n\n• For Android, download it from the Google Play Store\n• For iPhone, download it from the Apple App Store\n\nMake sure you are installing the correct app, as it will be used throughout the entire assignment.',
                images: [appStoreImg, playStoreImg],
            },
            {
                id: '1-2',
                title: 'Open the app and grant permissions',
                body: 'Open the app and allow the required permissions when prompted.\n\nMake sure to grant:\n• **Physical Activity or Motion & Fitness** permission as all the time\n• **Location** permission as all the time\n\nThese permissions allow the app to access motion and location data, which are essential for recording sensor data correctly.',
                hint: 'If you miss a permission, you can enable it later in your phone\'s settings under app permissions.',
            },
            {
                id: '1-3',
                title: 'Explore the available sensors',
                body: 'On the home screen, look through the list of sensors available in the app.\n\nSpend a few minutes exploring:\n• view the list of available sensors\n• open one of the sensors\n• examine the data being displayed in real time\n\nThis will help you understand what kind of data your device can collect before starting a recording.',
                hint: 'Try opening the Accelerometer to see how your movement affects the data.',
                image: sensorsPage,
            },
        ],
    },
    {
        label: 'Part 2',
        title: 'Join a Study',
        preamble: 'In this part, you will join a study within the app. This connects your recordings to a the server to be used for analysis.',
        cards: [
            {
                id: '2-1',
                title: 'Go to the Studies tab',
                body: 'Navigate to the **Studies** tab at the bottom of the app.\n\nThis section allows you to join and manage studies that your data will be associated with.',
                // hint: '',
            },
            {
                id: '2-2',
                title: 'Join the assigned study',
                body: 'Click on Join study, then on \"find a study\" under \"I am a Participant\". Enter study code "DDHLIVE1" and click View Study. This will take you to a page where you can see all the sensors that will be used by this study; finally on Join Study.\n\nOnce joined, you will be ask a few question so that we can sync that data from this device belongs to you.',
                // hint: 'If you do not see the study, double-check the instructions or study code provided.',
                carousel: [studyImg1, studyImg2, studyImg3, studyImg4, studyImg5]
            },
            {
                id: '2-3',
                title: 'Take a screenshot of the active study',
                body: 'Confirm that the study appears as active in the studies page on the app. This ensures your data will be linked correctly. Take a screenshot showing that the study is active.\n\nThis screenshot is required as proof that you successfully joined the study.',
                // hint: 'Make sure the study name is clearly visible in the screenshot.',
                upload: true
            },
        ],
    },
    {
        label: 'Part 3',
        title: 'Start, Stop, and Upload a Recording',
        preamble: 'In this part, you will learn how to record sensor data and upload it to the server. You will also understand how recordings behave in the background.',
        cards: [
            {
                id: '3-1',
                title: 'Start a recording',
                body: 'Return to the home screen and start a recording.\n\nOnce started, the app will begin collecting sensor data from your device in real time.',
                image: recordingImg1
            },
            {
                id: '3-2',
                title: 'Understand background recording',
                body: 'After starting the recording, note the following:\n\n• recording continues when you switch to another app\n• this works because of granted permissions\n• if you fully close the app, recording will stop\n\nMake sure the app stays running in the background.',
                hint: 'Do not swipe the app away from your recent apps list.',
            },
            {
                id: '3-3',
                title: 'End the recording and upload it',
                body: 'Stop the recording.\n\nWhen prompted, choose to **upload** the recording. This sends your collected data to the server.',
                // hint: 'Uploading immediately ensures your data is safely stored.',
                image: recordingImg2
            },
            {
                id: '3-4',
                title: 'Upload from the Recordings tab',
                body: 'Start another recording, then stop it but **do not upload immediately**.\n\nInstead:\n\n• go to the **Recordings** tab\n• find recordings labeled **To Upload**\n• select one and upload it manually\n\nThis helps you understand how to manage recordings after they are created.',
                hint: 'You should see both “Uploaded” and “To Upload” statuses.',
                carousel: [recordingImg3, recordingImg4]
            },
        ],
    },
    {
        label: 'Part 4',
        title: 'Use the DDH Portal',
        preamble: 'In this part, you will observe how your recorded data appears on the DDH portal and understand how real-time data streaming works.',
        cards: [
            {
                id: '4-1',
                title: 'Start another recording',
                body: 'Begin a new recording in the Sensor Logger app and keep it running.\n\nThis recording will be used to observe live data in the portal. Do not stop the recording until instructed.',
                // hint: '',
            },
            {
                id: '4-2',
                title: 'Open the DDH portal',
                body: 'Open the **DDH portal** in your browser.\n\nNavigate to the **Live Sensor Stream** page to observe your data in real-time. Once you navigate to the stream page, you should see data if you have an active recording.',
                // hint: '',
            },
            {
                id: '4-3',
                title: 'Observe incoming data',
                body: 'Watch the data appear in the portal.\n\nYou will notice a delay of about **5 seconds**. This is because data is processed in small time windows, not streamed instantly.',
                // hint: 'This delay is expected and part of how the system works.',
            },
        ],
    },
    {
        label: 'Part 5',
        title: 'Understand Data Storage and Uploading',
        preamble: 'This part explains how data is handled behind the scenes, including why uploading is still required after live streaming.',
        cards: [
            {
                id: '5-1',
                title: 'How data is collected',
                body: 'Sensor Logger collects data in small chunks called **windows** (about 5 seconds).\n\nEach window is stored locally and then sent to the server.',
                hint: 'Note: Window size can be configured but is fixed for this assignment.',
            },
            {
                id: '5-2',
                title: 'What happens during streaming',
                body: 'If the connection is strong, data is sent to the server almost immediately.\n\nHowever, if connectivity is weak, some data may not reach the server during recording. This is why live data may sometimes have gaps.',
            },
            {
                id: '5-3',
                title: 'Why uploading is required',
                body: 'When you upload after recording ends, the full dataset is sent to the server.\n\nThis fills in any missing data that was not successfully streamed.\n\nStreaming provides quick access, while uploading ensures completeness.',
                hint: 'Please Note: This is not a standard in IoT/IoMT systems. This is just for the purpose of these assignments and how sensor logger app works. In real IoT/IoMT systems, there are more sophisticated mechanisms for handling data loss and ensuring data integrity.',
                image: understadningImg
            },
        ],
    },
    {
        label: 'Part 6',
        title: 'Record a Real-World Event',
        preamble: 'In this part, you will create a physical event and observe how it appears in sensor data.',
        cards: [
            {
                id: '6-1',
                title: 'Create an event',
                body: 'Go to the **Accelerometer** tab.\n\nHold your phone above a soft surface (like a pillow) and gently drop it.\n\nThis will create a clear signal in the data.',
                hint: 'Be careful and only drop from a small height onto a soft surface.',
            },
            {
                id: '6-2',
                title: 'View the event',
                body: 'Look at the data and identify where the drop occurred.\n\nYou should see a noticeable spike or change at that moment.',
                hint: 'Focus on sudden changes in the graph.',
            },
            {
                id: '6-3',
                title: 'Capture and submit',
                body: 'Note the time of the event and take a screenshot of the data.\n\nThis screenshot will be submitted as part of the assignment.',
                hint: 'Make sure the event is clearly visible in the screenshot.',
            },
        ],
    },
    {
        label: 'Part 7',
        title: 'Identify Device Sensors',
        preamble: 'In this final part, you will identify the sensors available on your device.',
        cards: [
            {
                id: '7-1',
                title: 'Review sensors',
                body: 'Return to the sensor list and review all available sensors on your device.\n\nDifferent devices may have different sensors.',
                hint: 'Take your time to scroll through the full list.',
            },
            {
                id: '7-2',
                title: 'List the sensors',
                body: 'Write down the sensors shown in the app.\n\nThis information helps us (the course staff) understand device capabilities across users.',
                dynamicList: true,
                hint: 'Include all visible aside from smart watch sensors',
            },
        ],
    },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

function totalCards(parts) {
    return parts.reduce((sum, p) => sum + p.cards.length, 0);
}

/**
 * Very basic formatter: replaces **text** with <strong>text</strong>
 */
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

function DynamicList({ id, items, setItems }) {
    const [input, setInput] = useState('');

    const add = () => {
        if (input.trim() && !items.includes(input.trim())) {
            setItems([...items, input.trim()]);
            setInput('');
        }
    };

    const remove = (val) => {
        setItems(items.filter(item => item !== val));
    };

    return (
        <div className="card-dynamic-table">
            <table className="sensor-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>Sensor Name</th>
                        <th style={{ width: '100px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td className="col-num">{i + 1}</td>
                            <td className="col-name">{item}</td>
                            <td>
                                <button className="btn-delete" onClick={() => remove(item)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    <tr className="row-input">
                        <td className="col-num">{items.length + 1}</td>
                        <td>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type sensor name..."
                                onKeyDown={(e) => e.key === 'Enter' && add()}
                                id={`list-input-${id}`}
                            />
                        </td>
                        <td>
                            <button className="btn-add" onClick={add}>Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function ImageCarousel({ images }) {
    const [index, setIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const next = (e) => {
        e.stopPropagation();
        if (index < images.length - 1) setIndex(index + 1);
    };
    const prev = (e) => {
        e.stopPropagation();
        if (index > 0) setIndex(index - 1);
    };

    return (
        <div className="card-carousel">
            <div className="carousel-main">
                {index > 0 && (
                    <button className="carousel-nav prev" onClick={prev} aria-label="Previous image">‹</button>
                )}
                <img src={images[index]} alt="" className="carousel-image" />
                {index < images.length - 1 && (
                    <button className="carousel-nav next" onClick={next} aria-label="Next image">›</button>
                )}
            </div>
            {images.length > 1 && (
                <div className="carousel-indicators">
                    {images.map((_, i) => (
                        <span
                            key={i}
                            className={`carousel-dot ${i === index ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* Upload zone inside a card */
function UploadZone({ partIndex, cardIndex, username }) {
    const inputRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | done | error
    const [statusMsg, setStatusMsg] = useState('');
    const [uploadedName, setUploadedName] = useState('');
    const [dragover, setDragover] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        const renamedFile = buildFileName(username, partIndex, cardIndex, file);

        // Use the provided path format: class-data/home-assignments/assignment-0/[student-username]/[item]
        const safeUsername = (username ?? 'student').replace(/[^a-zA-Z0-9._-]/g, '.');
        const key = `home-assignments/assignment-0/${safeUsername}/${renamedFile}`;

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
            {status === 'idle' && (
                <p className="upload-subtext">Any file type accepted. Previous uploads will be replaced.</p>
            )}
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

/* Single card */
function AssignmentCard({ card, partIndex, cardIndex, checked, onToggle, username, sensorList, setSensorList }) {
    return (
        <div className={`assignment-card ${checked ? 'completed' : ''}`}>
            <div className="card-gutter">
                <span className="card-number">{String(cardIndex + 1).padStart(2, '0')}</span>
                <button
                    className={`card-checkbox ${checked ? 'checked' : ''}`}
                    onClick={onToggle}
                    aria-label={checked ? 'Mark as incomplete' : 'Mark as done'}
                    id={`checkbox-P${partIndex}-C${cardIndex}`}
                    title={checked ? 'Mark as incomplete' : 'Mark as done'}
                >
                    <Checkmark />
                </button>
            </div>

            <div className="card-content">
                <h2 className="card-title">{card.title}</h2>

                {card.body && <p className="card-body">{formatBody(card.body)}</p>}

                {card.image && (
                    <img
                        src={card.image}
                        alt={card.title}
                        className="card-image"
                    />
                )}

                {card.images && (
                    <div className="card-images-container">
                        {card.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${card.title} ${idx + 1}`}
                                className="card-image"
                            />
                        ))}
                    </div>
                )}

                {card.code && (
                    <pre className="card-code-block">{card.code}</pre>
                )}

                {card.carousel && (
                    <ImageCarousel images={card.carousel} />
                )}

                {card.dynamicList && (
                    <DynamicList id={card.id} items={sensorList} setItems={setSensorList} />
                )}

                {card.hint && (
                    <div className="card-hint">💡 {card.hint}</div>
                )}

                {card.upload && (
                    <UploadZone
                        partIndex={partIndex}
                        cardIndex={cardIndex}
                        username={username}
                    />
                )}

                {card.action && (
                    <button
                        className="card-action-btn"
                        onClick={card.action.onClick}
                    >
                        {card.action.label}
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── Assignment Intro ─────────────────────────────────────────── */

function AssignmentIntro() {
    return (
        <section className="assignment-intro">
            <p>
                The <strong>Internet of Things (IoT)</strong>, and more specifically the <strong>Internet of Medical Things (IoMT)</strong>, refers to systems where devices collect and share data from the real world.
            </p>
            <p>
                These systems are built on three main components: <strong>sensors, connectivity, and software</strong>.
            </p>
            <p>
                Sensors collect data such as motion or location using components like accelerometers and GPS. Connectivity allows this data to be transmitted from the device to external systems using networks like Wi-Fi or mobile data. Software then processes, stores, and visualizes this data, turning raw signals into useful information.
            </p>
            <p>
                In this assignment, we will focus on <strong>sensors and connectivity</strong>.
            </p>
            <p>
                You will use the Sensor Logger app to collect data from your device and observe how it is transmitted to and displayed in the DDH portal. By the end of this assignment, you should be able to:
            </p>
            <ul>
                <li>install and set up the Sensor Logger app</li>
                <li>join a study</li>
                <li>start and stop a recording</li>
                <li>upload recorded data</li>
                <li>observe live data in the DDH portal</li>
                <li>understand how data is stored and uploaded</li>
                <li>capture a real-world event in the sensor data</li>
                <li>identify which sensors are available on your device</li>
            </ul>
            <p>
                <strong>Note from TAs:</strong> We highly recommend that you use a laptop to complete this assignment. The best setup is to have this assignment open on your laptop and a way to transfer screenshots from your phone (such as WhatsApp Web, email, or any other file-sharing app). You will be asked to upload screenshots from both your phone and your computer for this assignment.            </p>
        </section>
    );
}

/* Part header + cards */
function AssignmentPart({ part, partIndex, checked, onToggle, username, sensorList, setSensorList }) {
    return (
        <section className="assignment-part">
            <div className="assignment-part-header">
                <p className="assignment-part-label">{part.label}</p>
                <h2 className="assignment-part-title">{part.title}</h2>
                {part.preamble && (
                    <p className="assignment-part-preamble">{part.preamble}</p>
                )}
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
                        sensorList={sensorList}
                        setSensorList={setSensorList}
                    />
                ))}
            </div>
        </section>
    );
}

/* ─── Page ─────────────────────────────────────────────────────── */

export default function Assignment0() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [checked, setChecked] = useState({});
    const [sensorList, setSensorList] = useState([]);
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | success | error
    const [submitMsg, setSubmitMsg] = useState('');
    const [hasExistingSubmission, setHasExistingSubmission] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!isLoaded || !user) return;
            const safeUsername = (user.username ?? user.firstName ?? 'student').replace(/[^a-zA-Z0-9._-]/g, '.');
            const fileName = `${safeUsername}_A0_SensorList.txt`;
            const key = `home-assignments/assignment-0/${safeUsername}/${fileName}`;
            try {
                // Check if the sensor list file exists in MinIO
                const res = await fetch(`${BACKEND}/api/minio/file?bucket=class-data&key=${key}`);
                if (res.ok) {
                    setHasExistingSubmission(true);
                }
            } catch (err) {
                console.error('Failed to check submission status:', err);
            }
        };
        checkStatus();
    }, [user, isLoaded]);

    const username = user?.username ?? user?.firstName ?? 'student';
    const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

    const modifiedParts = useMemo(() => {
        return PARTS.map(part => ({
            ...part,
            cards: part.cards.map(card => {
                if (card.id === '4-2') {
                    return {
                        ...card,
                        action: {
                            label: 'Go to Live Sensor Stream',
                            onClick: () => window.open('/ddh-portal/assignments/0/live-sensor-stream', '_blank')
                        }
                    };
                }
                return card;
            })
        }));
    }, [navigate]);

    const total = totalCards(PARTS);
    const done = Object.values(checked).filter(Boolean).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const handleSubmit = async () => {
        if (sensorList.length === 0) {
            setSubmitStatus('error');
            setSubmitMsg('Please add at least one sensor before submitting.');
            return;
        }

        setSubmitStatus('loading');
        setSubmitMsg('Submitting sensor list…');

        try {
            // Convert list to a text file blob
            const content = `Sensor List for ${username}:\n\n` + sensorList.map((s, i) => `${i + 1}. ${s}`).join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const file = new File([blob], 'sensors.txt');

            // Naming convention for this specific list
            const safeUsername = username.replace(/[^a-zA-Z0-9._-]/g, '.');
            const fileName = `${safeUsername}_A0_SensorList.txt`;
            const key = `home-assignments/assignment-0/${safeUsername}/${fileName}`;

            await uploadToMinio(file, key);
            setHasExistingSubmission(true);
            setSubmitStatus('success');
            setSubmitMsg('Assignment submitted successfully!');
        } catch (err) {
            setSubmitStatus('error');
            setSubmitMsg(err.message ?? 'Submission failed.');
        }
    };

    return (
        <div className="assignment-page">
            <header className="assignment-page-header">
                <button
                    className="assignment-back-btn"
                    onClick={() => navigate('/home-assignments')}
                    id="assignment0-back-btn"
                >
                    ← Back
                </button>
                <h1 className="assignment-page-title">Assignment 0 — Digital Health Intro</h1>
                <div className="assignment-progress-info">
                    <span className="assignment-progress-summary">{done} / {total} done</span>
                    <div className="assignment-progress-bar-wrapper">
                        <div className="assignment-progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </header>

            <main className="assignment-page-body">
                {hasExistingSubmission && (
                    <div className="submission-notice">
                        <span>💡</span>
                        <p><strong>Assignment Already Submitted:</strong> You have previously submitted this assignment. Any new submission will <strong>overwrite</strong> your previous data.</p>
                    </div>
                )}
                <AssignmentIntro />
                {modifiedParts.map((part, pIdx) => (
                    <AssignmentPart
                        key={pIdx}
                        part={part}
                        partIndex={pIdx + 1}
                        checked={checked}
                        onToggle={toggle}
                        username={username}
                        sensorList={sensorList}
                        setSensorList={setSensorList}
                    />
                ))}

                <div className="assignment-submit-section">
                    <button
                        className={`assignment-submit-btn ${submitStatus}`}
                        onClick={handleSubmit}
                        disabled={submitStatus === 'loading'}
                    >
                        {submitStatus === 'loading' ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                    {submitMsg && (
                        <p className={`submit-status-msg ${submitStatus}`}>
                            {submitStatus === 'success' ? '✅ ' : submitStatus === 'error' ? '❌ ' : '⏳ '}
                            {submitMsg}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
