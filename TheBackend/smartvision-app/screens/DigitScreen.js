import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions, Modal, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_URL = "https://devansh-agarwal-smartvision-api.hf.space";

export default function DigitScreen() {
    const [inputMode, setInputMode] = useState('upload');
    const [imageUri, setImageUri] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [aiResult, setAiResult] = useState("");
    const [confidence, setConfidence] = useState(0);
    const [isErasing, setIsErasing] = useState(false);
    const [penSize, setPenSize] = useState(4);
    const [canvasMemory, setCanvasMemory] = useState(null);
    const canvasRef = useRef();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 1 });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return Alert.alert("Error", "Camera access denied");
        let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const handleEnd = () => canvasRef.current?.readSignature();
    const handleOK = (signature) => {
        if (isAnalyzing) triggerAI(signature);
        else setCanvasMemory(signature);
    };



    const triggerAI = async (sourceUri) => {
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 250));

        try {
            let formData = new FormData();
            formData.append('file', { uri: sourceUri, name: 'digit.jpg', type: 'image/jpeg' });

            const response = await fetch(`${BASE_URL}/predict-digit`, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = await response.json();


            if (data.digit !== undefined && data.digit !== null) {
                setAiResult(`Detected: ${data.digit}`);
            } else {
                setAiResult(data.error || "Nothing detected");
            }

            setConfidence(data.confidence || "0%");
            setModalVisible(true);

        } catch (error) {
            Alert.alert("Error", "Check if Replit is running.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>DIGIT <Text style={styles.cyanText}>ANALYSIS</Text></Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity style={[styles.tglBtn, inputMode === 'upload' && styles.tglActive]} onPress={() => setInputMode('upload')}><Text style={[styles.tglTxt, inputMode === 'upload' && styles.tglTxtActive]}>PHOTO</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tglBtn, inputMode === 'draw' && styles.tglActive]} onPress={() => setInputMode('draw')}><Text style={[styles.tglTxt, inputMode === 'draw' && styles.tglTxtActive]}>DRAW</Text></TouchableOpacity>
            </View>
            {inputMode === 'upload' ? (
                <View style={styles.content}>
                    <View style={styles.previewGlass}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.fullImg} /> : <Text style={styles.mute}>Awaiting Input...</Text>}</View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.glassBtn} onPress={pickImage}><Text style={styles.glassBtnTxt}>GALLERY</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.glassBtn} onPress={takePhoto}><Text style={styles.glassBtnTxt}>CAMERA</Text></TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.drawArea}>
                    <View style={styles.toolbarGlass}>
                        <TouchableOpacity style={[styles.tool, isErasing && styles.toolActive]} onPress={() => { if (isErasing) canvasRef.current?.draw(); else canvasRef.current?.erase(); setIsErasing(!isErasing) }}><Text style={styles.icon}>{isErasing ? '✍️' : '🧽'}</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.tool} onPress={() => canvasRef.current?.undo()}><Text style={styles.icon}>↩️</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.toolRed} onPress={() => { setCanvasMemory(null); canvasRef.current?.clearSignature() }}><Text style={styles.icon}>🗑️</Text></TouchableOpacity>
                        <View style={styles.vDivider} /><View style={styles.sizeGroup}>{[2, 8, 16].map(s => (<TouchableOpacity key={s} style={[styles.sizeDot, penSize === s && styles.activeSize]} onPress={() => setPenSize(s)}><View style={[styles.dot, { width: s + 2, height: s + 2 }]} /></TouchableOpacity>))}</View>
                    </View>
                    <View style={styles.canvasGlass}>
                        <SignatureScreen
                            key={`canvas-${penSize}`}
                            ref={canvasRef}
                            onOK={handleOK}
                            onEnd={handleEnd}
                            dataURL={canvasMemory}
                            minWidth={penSize}
                            maxWidth={penSize + 1}
                            backgroundColor="#ffffff"
                            penColor="#000000"
                            webStyle={`
    .m-signature-pad { 
      background-color: #ffffff; 
      border: none; 
      box-shadow: none; 
    }
    .m-signature-pad--body {
      background-color: #ffffff;
    }
    .m-signature-pad--footer {
      display: none; 
      margin: 0px;
    }
  `}
                            autoClear={false}
                            descriptionText=""
                        />
                    </View>
                </View>
            )}
            <TouchableOpacity style={styles.mainBtnContainer} onPress={() => { if (inputMode === 'upload' && !imageUri) return Alert.alert("Empty", "Upload a photo"); setIsAnalyzing(true); inputMode === 'upload' ? triggerAI(imageUri) : canvasRef.current?.readSignature() }}>
                <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.mainBtn}>{isAnalyzing ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnTxt}>ANALYZE DATA</Text>}</LinearGradient>
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}><View style={styles.modalContent}><LinearGradient colors={['#1e293b', '#0f172a']} style={styles.modalGradient}><View style={styles.modalHeader}><Text style={styles.modalTitle}>AI ANALYSIS RESULT</Text><TouchableOpacity onPress={() => setModalVisible(false)}><MaterialCommunityIcons name="close-circle" size={28} color="#ef4444" /></TouchableOpacity></View><View style={styles.confidenceBox}><Text style={styles.confLabel}>Confidence Score:</Text><Text style={styles.confValue}>{confidence}%</Text></View><ScrollView style={styles.resultScroll}><Text style={styles.resultLabel}>Detected Content:</Text><View style={styles.resultBox}><Text style={styles.resultContentText}>{aiResult}</Text></View></ScrollView><View style={styles.modalFooter}><TouchableOpacity style={styles.copyBtn} onPress={async () => { await Clipboard.setStringAsync(aiResult); Alert.alert("Success", "Copied!"); }}><Text style={styles.copyBtnText}>COPY TEXT</Text></TouchableOpacity><TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}><Text style={styles.closeBtnText}>CLOSE</Text></TouchableOpacity></View></LinearGradient></View></View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', paddingTop: 20 },
    headerTitle: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 4, marginBottom: 25 },
    cyanText: { color: '#38bdf8' },
    toggleRow: { flexDirection: 'row', width: '80%', backgroundColor: '#1e293b', borderRadius: 15, padding: 4, marginBottom: 25 },
    tglBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tglActive: { backgroundColor: '#334155' },
    tglTxt: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
    tglTxtActive: { color: '#38bdf8' },
    content: { width: '90%', alignItems: 'center' },
    previewGlass: { width: '100%', height: SCREEN_HEIGHT * 0.38, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    fullImg: { width: '100%', height: '100%' },
    mute: { color: '#475569', fontSize: 12 },
    drawArea: { width: '92%', alignItems: 'center' },
    toolbarGlass: { flexDirection: 'row', width: '100%', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 10, borderRadius: 20, marginBottom: 15, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#334155' },
    tool: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    toolRed: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' },
    toolActive: { backgroundColor: '#38bdf8' },
    icon: { fontSize: 18 },
    vDivider: { width: 1, height: 25, backgroundColor: '#334155' },
    sizeGroup: { flexDirection: 'row', alignItems: 'center' },
    sizeDot: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
    activeSize: { backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: '#38bdf8' },
    dot: { backgroundColor: '#f8fafc', borderRadius: 20 },
    canvasGlass: { width: '100%', height: SCREEN_HEIGHT * 0.38, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
    glassBtn: { backgroundColor: '#1e293b', paddingVertical: 15, borderRadius: 15, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    glassBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    mainBtnContainer: { width: '90%', position: 'absolute', bottom: 35 },
    mainBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    mainBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 3 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { height: '65%', width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
    modalGradient: { flex: 1, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    confidenceBox: { backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', alignItems: 'center' },
    confLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
    confValue: { color: '#38bdf8', fontSize: 24, fontWeight: '900', marginTop: 5 },
    resultScroll: { flex: 1 },
    resultLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
    resultBox: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
    resultContentText: { color: '#cbd5e1', fontSize: 16, lineHeight: 24 },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    copyBtn: { flex: 1.5, backgroundColor: '#38bdf8', paddingVertical: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    copyBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 12 },
    closeBtn: { flex: 1, backgroundColor: 'transparent', paddingVertical: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
    closeBtnText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 }
});