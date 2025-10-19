/**
 * PDF Components for Export Service
 * React PDF components used by the PDF export service
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PracticeScript } from "@services";
import { colorTokens } from "../../design-system/tokens";
import { getDisplayName } from "../../utils/playNameUtils";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.blue[600],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colorTokens.gray[500],
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    color: colorTokens.gray[500],
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.gray[200],
    paddingBottom: 4,
  },
  playItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: colorTokens.gray[50],
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colorTokens.gray[200],
  },
  playHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  playName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colorTokens.gray[800],
    flex: 1,
  },
  playMeta: {
    fontSize: 10,
    color: colorTokens.gray[500],
  },
  playDescription: {
    fontSize: 11,
    color: colorTokens.gray[600],
    marginBottom: 4,
  },
  playDetails: {
    fontSize: 10,
    color: colorTokens.gray[500],
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colorTokens.blue[50],
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colorTokens.blue[200],
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: "colorTokens.indigo[800]",
    marginBottom: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    fontSize: 9,
    backgroundColor: "colorTokens.indigo[100]",
    color: "colorTokens.indigo[800]",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 2,
  },
});

export type PDFFormat = "compact" | "detailed";

interface PracticeScriptPDFProps {
  script: PracticeScript;
  format?: PDFFormat;
}

export const PracticeScriptPDF: React.FC<PracticeScriptPDFProps> = ({
  script,
  format = "detailed",
}) => {
  const totalPlays = script.plays?.length || 0;
  const totalRepetitions =
    script.plays?.reduce((sum, play) => sum + play.repetitions, 0) || 0;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Script Name Prominent */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {script.title || script.name || "Untitled Practice Script"}
          </Text>
          {script.description && (
            <Text style={styles.subtitle}>{script.description}</Text>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={styles.meta}>
              Created: {formatDate(script.createdAt)}
            </Text>
            <Text style={styles.meta}>
              {totalPlays} plays • {totalRepetitions} reps
            </Text>
          </View>
          {script.tags && script.tags.length > 0 && (
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

          {script.plays &&
            script.plays.map((scriptPlay, index) => (
              <View key={scriptPlay.id} style={styles.playItem} wrap={false}>
                {/* Play Header - Exactly Like Playbook Card */}
                <View style={styles.playHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    {/* Number Badge */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: colorTokens.jade[600],
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#ffffff",
                        }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    
                    {/* Play Name and Formation Together - Using exact playbook formatting */}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playName}>
                        {scriptPlay.play ? getDisplayName(scriptPlay.play, false) : "Unknown Play"}
                      </Text>
                      
                      {/* Defensive & Situation Info - Compact subtitle (only in compact format) */}
                      {format === "compact" && (
                        <View style={{ marginTop: 4 }}>
                          {/* Defensive Look */}
                          {(scriptPlay.defensiveFront || scriptPlay.coverage || (scriptPlay.blitz && scriptPlay.blitz !== "none")) && (
                            <Text
                              style={{
                                fontSize: 9,
                                color: colorTokens.red[700],
                                marginBottom: 2,
                              }}
                            >
                              🛡️ {scriptPlay.defensiveFront && `${scriptPlay.defensiveFront}`}
                              {scriptPlay.coverage && ` • ${scriptPlay.coverage.replace(/_/g, " ")}`}
                              {scriptPlay.blitz && scriptPlay.blitz !== "none" && ` • ${scriptPlay.blitz.replace(/_/g, " ")}`}
                            </Text>
                          )}
                          
                          {/* Game Situation */}
                          {(scriptPlay.hash || scriptPlay.downDistance || scriptPlay.fieldPosition) && (
                            <Text
                              style={{
                                fontSize: 9,
                                color: colorTokens.amber[800],
                              }}
                            >
                              📍 {scriptPlay.hash && `${scriptPlay.hash}`}
                              {scriptPlay.downDistance && ` • ${scriptPlay.downDistance}`}
                              {scriptPlay.fieldPosition && ` • ${scriptPlay.fieldPosition.replace(/_/g, " ")}`}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Reps Badge */}
                  <View
                    style={{
                      backgroundColor: colorTokens.jade[100],
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: colorTokens.jade[600],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "bold",
                        color: colorTokens.jade[900],
                      }}
                    >
                      {scriptPlay.repetitions} reps
                    </Text>
                  </View>
                </View>

                {/* Detailed Format - Show full boxes */}
                {format === "detailed" && (
                  <>
                    {/* Offensive Details - Type, Personnel, Direction */}
                    <View
                      style={{
                        marginBottom: 10,
                        padding: 8,
                        backgroundColor: colorTokens.blue[50],
                        borderRadius: 4,
                      }}
                    >
                  <Text
                    style={{
                      fontSize: 9,
                      color: colorTokens.blue[700],
                      marginBottom: 6,
                      fontWeight: "bold",
                    }}
                  >
                    OFFENSIVE DETAILS
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colorTokens.blue[100],
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: colorTokens.blue[300],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          color: colorTokens.blue[900],
                          fontWeight: "bold",
                        }}
                      >
                        {scriptPlay.play?.p_type || "Unknown Type"}
                      </Text>
                    </View>
                    {scriptPlay.play?.personnel && (
                      <View
                        style={{
                          backgroundColor: colorTokens.blue[100],
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: colorTokens.blue[300],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            color: colorTokens.blue[900],
                            fontWeight: "bold",
                          }}
                        >
                          Personnel: {scriptPlay.play.personnel}
                        </Text>
                      </View>
                    )}
                    {scriptPlay.play?.p_dir && (
                      <View
                        style={{
                          backgroundColor: colorTokens.blue[100],
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: colorTokens.blue[300],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            color: colorTokens.blue[900],
                            fontWeight: "bold",
                          }}
                        >
                          Direction: {scriptPlay.play.p_dir}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Defensive Details - Separate Box */}
                {(scriptPlay.defensiveFront ||
                  scriptPlay.coverage ||
                  (scriptPlay.blitz && scriptPlay.blitz !== "none")) && (
                  <View
                    style={{
                      marginBottom: 10,
                      padding: 8,
                      backgroundColor: colorTokens.red[50],
                      borderRadius: 4,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: colorTokens.red[200],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        color: colorTokens.red[700],
                        marginBottom: 6,
                        fontWeight: "bold",
                      }}
                    >
                      DEFENSIVE LOOK
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {scriptPlay.defensiveFront && (
                        <View
                          style={{
                            backgroundColor: colorTokens.red[100],
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: colorTokens.red[300],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: colorTokens.red[900],
                              fontWeight: "bold",
                            }}
                          >
                            Front: {scriptPlay.defensiveFront}
                          </Text>
                        </View>
                      )}
                      {scriptPlay.coverage && (
                        <View
                          style={{
                            backgroundColor: colorTokens.red[100],
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: colorTokens.red[300],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: colorTokens.red[900],
                              fontWeight: "bold",
                            }}
                          >
                            Coverage: {scriptPlay.coverage.replace(/_/g, " ")}
                          </Text>
                        </View>
                      )}
                      {scriptPlay.blitz && scriptPlay.blitz !== "none" && (
                        <View
                          style={{
                            backgroundColor: colorTokens.red[100],
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: colorTokens.red[300],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: colorTokens.red[900],
                              fontWeight: "bold",
                            }}
                          >
                            Blitz: {scriptPlay.blitz.replace(/_/g, " ")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Game Situation */}
                {(scriptPlay.hash ||
                  scriptPlay.downDistance ||
                  scriptPlay.fieldPosition) && (
                  <View
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: colorTokens.amber[50],
                      borderRadius: 4,
                      borderLeftWidth: 3,
                      borderLeftStyle: "solid",
                      borderLeftColor: colorTokens.amber[500],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        color: colorTokens.amber[900],
                        marginBottom: 4,
                      }}
                    >
                      🎯 GAME SITUATION
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 4,
                      }}
                    >
                      {scriptPlay.hash && (
                        <Text
                          style={{
                            fontSize: 9,
                            color: colorTokens.amber[800],
                          }}
                        >
                          Hash: {scriptPlay.hash}
                        </Text>
                      )}
                      {scriptPlay.downDistance && (
                        <Text
                          style={{
                            fontSize: 9,
                            color: colorTokens.amber[800],
                          }}
                        >
                          • {scriptPlay.downDistance}
                        </Text>
                      )}
                      {scriptPlay.fieldPosition && (
                        <Text
                          style={{
                            fontSize: 9,
                            color: colorTokens.amber[800],
                          }}
                        >
                          • {scriptPlay.fieldPosition.replace(/_/g, " ")}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                  </>
                )}

                {/* Coaching Points - Always show */}
                {scriptPlay.notes && (
                  <View
                    style={{
                      marginTop: 4,
                      padding: 6,
                      borderLeftWidth: 3,
                      borderLeftStyle: "solid",
                      borderLeftColor: colorTokens.jade[500],
                      backgroundColor: colorTokens.jade[50],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontStyle: "italic",
                        color: colorTokens.gray[700],
                      }}
                    >
                      💡 Coaching Points: {scriptPlay.notes}
                    </Text>
                  </View>
                )}
              </View>
            ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Practice Summary</Text>
          <Text style={styles.summaryText}>Total Plays: {totalPlays}</Text>
          <Text style={styles.summaryText}>
            Total Repetitions: {totalRepetitions}
          </Text>
          <Text style={styles.summaryText}>
            Average Reps per Play:{" "}
            {totalPlays > 0 ? Math.round(totalRepetitions / totalPlays) : 0}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
