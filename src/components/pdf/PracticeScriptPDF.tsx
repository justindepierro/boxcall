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
  pageCompact: {
    padding: 15,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.blue[600],
  },
  headerCompact: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.blue[600],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: colorTokens.gray[500],
    marginBottom: 8,
  },
  subtitleCompact: {
    fontSize: 9,
    color: colorTokens.gray[500],
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: colorTokens.gray[500],
    marginBottom: 2,
  },
  metaCompact: {
    fontSize: 7,
    color: colorTokens.gray[500],
    marginBottom: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionCompact: {
    marginBottom: 8,
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
  sectionTitleCompact: {
    fontSize: 11,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.gray[200],
    paddingBottom: 2,
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
  playItemCompact: {
    marginBottom: 6,
    padding: 6,
    backgroundColor: colorTokens.gray[50],
    borderRadius: 3,
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

export type PDFFormat = "compact" | "detailed" | "ultra-compact";

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

  // Use compact styles for ultra-compact format
  const isCompact = format === "ultra-compact";
  const pageStyle = isCompact ? styles.pageCompact : styles.page;
  const headerStyle = isCompact ? styles.headerCompact : styles.header;
  const titleStyle = isCompact ? styles.titleCompact : styles.title;
  const subtitleStyle = isCompact ? styles.subtitleCompact : styles.subtitle;
  const metaStyle = isCompact ? styles.metaCompact : styles.meta;
  const sectionStyle = isCompact ? styles.sectionCompact : styles.section;
  const sectionTitleStyle = isCompact ? styles.sectionTitleCompact : styles.sectionTitle;
  const playItemStyle = isCompact ? styles.playItemCompact : styles.playItem;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        {/* Header with Script Name Prominent */}
        <View style={headerStyle}>
          <Text style={titleStyle}>
            {script.title || script.name || "Untitled Practice Script"}
          </Text>
          {script.description && (
            <Text style={subtitleStyle}>{script.description}</Text>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: isCompact ? 3 : 6,
            }}
          >
            <Text style={metaStyle}>
              Created: {formatDate(script.createdAt)}
            </Text>
            <Text style={metaStyle}>
              {totalPlays} plays • {totalRepetitions} reps
            </Text>
          </View>
          {script.tags && script.tags.length > 0 && !isCompact && (
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
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Practice Script</Text>

          {script.plays &&
            script.plays.map((scriptPlay, index) => (
              <View key={scriptPlay.id} style={playItemStyle} wrap={false}>
                {/* ULTRA-COMPACT: Play name on top, game situation below */}
                {format === "ultra-compact" ? (
                  <>
                    {/* Row 1: Number badge + Personnel + Play name + One-word code + Play Type + Reps */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                      {/* Number Badge */}
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor: colorTokens.jade[600],
                          borderRadius: 9,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "bold",
                            color: "#ffffff",
                          }}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      {/* Personnel Badge - BEFORE play name */}
                      {scriptPlay.play?.personnel && (
                        <View
                          style={{
                            backgroundColor: colorTokens.blue[100],
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 2,
                            marginRight: 4,
                          }}
                        >
                          <Text style={{ fontSize: 7, color: colorTokens.blue[800] }}>
                            {scriptPlay.play.personnel}
                          </Text>
                        </View>
                      )}

                      {/* Full Play Name */}
                      {scriptPlay.play && (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: colorTokens.gray[900],
                            marginRight: 4,
                          }}
                        >
                          {(() => {
                            const play = scriptPlay.play;
                            // Generate full concatenated name
                            const formationParts: string[] = [];
                            const playParts: string[] = [];

                            // Formation parts
                            if (play.formation) formationParts.push(play.formation);
                            if (play.backfield) formationParts.push(play.backfield);
                            if (play.motion) formationParts.push(play.motion);
                            if (play.shift) formationParts.push(play.shift);

                            // Play parts
                            if (play.play_name) playParts.push(play.play_name);
                            if (play.p_dir) playParts.push(play.p_dir === "R" ? "Right" : play.p_dir === "L" ? "Left" : play.p_dir);
                            if (play.p_type) playParts.push(play.p_type);
                            if (play.protection) playParts.push(play.protection);

                            return [...formationParts, ...playParts].join(" ");
                          })()}
                        </Text>
                      )}

                      {/* One-word code in royal blue parentheses */}
                      {scriptPlay.play?.one_word_play && (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: "#4169E1", // Royal blue
                            marginRight: 4,
                          }}
                        >
                          ({scriptPlay.play.one_word_play})
                        </Text>
                      )}

                      {/* Play Type Badge */}
                      {scriptPlay.play?.play_type && (
                        <View
                          style={{
                            backgroundColor: colorTokens.purple[100],
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 2,
                            marginRight: 4,
                          }}
                        >
                          <Text style={{ fontSize: 7, color: colorTokens.purple[800] }}>
                            {scriptPlay.play.play_type}
                          </Text>
                        </View>
                      )}

                      {/* Reps Badge - Far right */}
                      <View
                        style={{
                          backgroundColor: colorTokens.jade[100],
                          paddingHorizontal: 5,
                          paddingVertical: 2,
                          borderRadius: 3,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: colorTokens.jade[600],
                          marginLeft: "auto",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 8,
                            fontWeight: "bold",
                            color: colorTokens.jade[900],
                          }}
                        >
                          {scriptPlay.repetitions}
                        </Text>
                      </View>
                    </View>

                    {/* Row 2: Game Situation Info - Horizontal with more spacing */}
                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginLeft: 24 }}>
                      {/* Hash */}
                      {scriptPlay.hash && (
                        <>
                          <Text style={{ fontSize: 7, color: colorTokens.amber[700], marginRight: 4 }}>
                            {scriptPlay.hash.toUpperCase()}
                          </Text>
                          <Text style={{ fontSize: 7, color: colorTokens.gray[400], marginHorizontal: 4 }}>|</Text>
                        </>
                      )}

                      {/* Down & Distance */}
                      {scriptPlay.downDistance && (
                        <>
                          <Text style={{ fontSize: 7, color: colorTokens.amber[800], fontWeight: "bold", marginRight: 4 }}>
                            {scriptPlay.downDistance}
                          </Text>
                          <Text style={{ fontSize: 7, color: colorTokens.gray[400], marginHorizontal: 4 }}>|</Text>
                        </>
                      )}

                      {/* Field Position */}
                      {scriptPlay.fieldPosition && (
                        <>
                          <Text style={{ fontSize: 7, color: colorTokens.amber[600], marginRight: 4 }}>
                            {scriptPlay.fieldPosition.replace(/_/g, " ")}
                          </Text>
                          <Text style={{ fontSize: 7, color: colorTokens.gray[400], marginHorizontal: 4 }}>|</Text>
                        </>
                      )}

                      {/* Defensive Front */}
                      {scriptPlay.defensiveFront && (
                        <>
                          <Text style={{ fontSize: 7, color: colorTokens.red[700], fontWeight: "bold", marginRight: 4 }}>
                            {scriptPlay.defensiveFront.toUpperCase()}
                          </Text>
                          <Text style={{ fontSize: 7, color: colorTokens.gray[400], marginHorizontal: 4 }}>|</Text>
                        </>
                      )}

                      {/* Coverage */}
                      {scriptPlay.coverage && (
                        <>
                          <Text style={{ fontSize: 7, color: colorTokens.red[600], marginRight: 4 }}>
                            {scriptPlay.coverage.replace(/_/g, " ")}
                          </Text>
                          {scriptPlay.blitz && scriptPlay.blitz !== "none" && (
                            <Text style={{ fontSize: 7, color: colorTokens.gray[400], marginHorizontal: 4 }}>|</Text>
                          )}
                        </>
                      )}

                      {/* Blitz */}
                      {scriptPlay.blitz && scriptPlay.blitz !== "none" && (
                        <Text style={{ fontSize: 7, color: colorTokens.red[800], marginRight: 4 }}>
                          {scriptPlay.blitz.replace(/_/g, " ")}
                        </Text>
                      )}
                    </View>

                    {/* Coaching Notes - Below if present */}
                    {scriptPlay.notes && (
                      <Text
                        style={{
                          fontSize: 6,
                          fontStyle: "italic",
                          color: colorTokens.gray[600],
                          marginTop: 2,
                          marginLeft: 24,
                        }}
                      >
                        Note: {scriptPlay.notes}
                      </Text>
                    )}
                  </>
                ) : (
                  // REGULAR COMPACT/DETAILED FORMAT
                  <>
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
                              {scriptPlay.defensiveFront && `${scriptPlay.defensiveFront}`}
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
                      GAME SITUATION
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

                {/* Coaching Points - Only show for non-ultra-compact OR if ultra-compact has no notes inline */}
                {scriptPlay.notes && format !== "ultra-compact" && (
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
                      Coaching Points: {scriptPlay.notes}
                    </Text>
                  </View>
                )}
              </>
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
