import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles voor PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2px solid #00ffff',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00ffff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
    },
    section: {
        marginTop: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00ffff',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        color: '#333333',
        marginBottom: 5,
    },
    redFlag: {
        backgroundColor: '#fff5f5',
        padding: 10,
        marginBottom: 8,
        borderLeft: '3px solid #ff0000',
    },
    redFlagTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff0000',
        marginBottom: 4,
    },
    score: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00ffff',
        marginTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999999',
        borderTop: '1px solid #eeeeee',
        paddingTop: 10,
    },
    disclaimer: {
        fontSize: 8,
        color: '#666666',
        fontStyle: 'italic',
        marginTop: 5,
    },
});

interface AnalysisPDFProps {
    data: {
        summary: string[];
        red_flags: Array<{
            clause_citation: string;
            risk_type: string;
            explanation: string;
            severity_score: number;
        }>;
        suggestions: string[];
        privacy_score: number;
        privacy_motivatie: string;
    };
    documentName?: string;
}

export const AnalysisPDF: React.FC<AnalysisPDFProps> = ({ data, documentName = "Document" }) => {
    const currentDate = new Date().toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>ClearClause Analyse Rapport</Text>
                    <Text style={styles.subtitle}>
                        Document: {documentName} • Datum: {currentDate}
                    </Text>
                </View>

                {/* Samenvatting */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Samenvatting</Text>
                    {data.summary.map((point, index) => (
                        <Text key={index} style={styles.text}>• {point}</Text>
                    ))}
                </View>

                {/* Privacy Score */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy Score</Text>
                    <Text style={styles.score}>{data.privacy_score}/10</Text>
                    <Text style={styles.text}>{data.privacy_motivatie}</Text>
                </View>

                {/* Red Flags */}
                {data.red_flags && data.red_flags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gedetecteerde Risico's</Text>
                        {data.red_flags.map((flag, index) => (
                            <View key={index} style={styles.redFlag}>
                                <Text style={styles.redFlagTitle}>
                                    {flag.risk_type} (Ernst: {flag.severity_score}/10)
                                </Text>
                                <Text style={styles.text}>{flag.explanation}</Text>
                                <Text style={[styles.text, { fontSize: 9, fontStyle: 'italic' }]}>
                                    "{flag.clause_citation}"
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Suggesties */}
                {data.suggestions && data.suggestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Aanbevelingen</Text>
                        {data.suggestions.map((suggestion, index) => (
                            <Text key={index} style={styles.text}>• {suggestion}</Text>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Gegenereerd door ClearClause AI • www.clearclause.ai</Text>
                    <Text style={styles.disclaimer}>
                        Dit rapport is gegenereerd door AI en dient als hulpmiddel.
                        Raadpleeg altijd een juridisch professional voor definitief advies.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
