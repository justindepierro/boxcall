/**
 * PDF Components for Export Service
 * React PDF components used by the PDF export service
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { PracticeScript } from '../../services/practiceScriptService';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  playItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: 1,
    borderColor: '#e2e8f0',
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  playName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  playMeta: {
    fontSize: 10,
    color: '#64748b',
  },
  playDescription: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
  },
  playDetails: {
    fontSize: 10,
    color: '#6b7280',
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    border: 1,
    borderColor: '#dbeafe',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#3730a3',
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    fontSize: 9,
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 2,
  },
});

interface PracticeScriptPDFProps {
  script: PracticeScript;
}

export const PracticeScriptPDF: React.FC<PracticeScriptPDFProps> = ({ script }) => {
  const totalPlays = script.plays.length;
  const totalRepetitions = script.plays.reduce((sum, play) => sum + play.repetitions, 0);
  const estimatedDuration = script.duration;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{script.name}</Text>
          {script.description && (
            <Text style={styles.subtitle}>{script.description}</Text>
          )}
          <Text style={styles.meta}>
            Created: {formatDate(script.createdAt)}
          </Text>
          <Text style={styles.meta}>
            Duration: {formatDuration(estimatedDuration)}
          </Text>
          {script.tags.length > 0 && (
            <View style={styles.tags}>
              {script.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Practice Script */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Script</Text>

          {script.plays.map((scriptPlay, index) => (
            <View key={scriptPlay.id} style={styles.playItem}>
              <View style={styles.playHeader}>
                <Text style={styles.playName}>
                  {index + 1}. {scriptPlay.play?.play_name || 'Unknown Play'}
                </Text>
                <Text style={styles.playMeta}>
                  {scriptPlay.repetitions}x • {scriptPlay.estimatedTime}min each
                </Text>
              </View>
              {scriptPlay.notes && (
                <Text style={styles.playDescription}>{scriptPlay.notes}</Text>
              )}
              <Text style={styles.playDetails}>
                Formation: {scriptPlay.play?.formation || 'Unknown'} •
                Type: {scriptPlay.play?.p_type || 'Unknown'}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Practice Summary</Text>
          <Text style={styles.summaryText}>
            Total Plays: {totalPlays}
          </Text>
          <Text style={styles.summaryText}>
            Total Repetitions: {totalRepetitions}
          </Text>
          <Text style={styles.summaryText}>
            Estimated Duration: {formatDuration(estimatedDuration)}
          </Text>
          <Text style={styles.summaryText}>
            Average Time per Play: {totalPlays > 0 ? Math.round(estimatedDuration / totalPlays) : 0} minutes
          </Text>
        </View>
      </Page>
    </Document>
  );
};