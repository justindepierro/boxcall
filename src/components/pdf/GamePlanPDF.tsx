/**
 * GamePlanPDF Component
 * Renders game plans as PDF documents using Billick Situational Method
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GamePlan } from "../playbook/GamePlanModal/types";
import type { GamePlanPDFFormat } from "../../services/gamePlanPdfService";
import {
  getAllBillickSituations,
  type BillickSituationConfig,
} from "../../constants/gamePlanSituations";
import { colorTokens } from "../../design-system/tokens";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  pageCompact: {
    padding: 12,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // Header Styles
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.blue[700],
  },
  headerCompact: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colorTokens.blue[700],
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 6,
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: "bold",
    color: colorTokens.blue[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colorTokens.gray[600],
    marginBottom: 4,
  },
  subtitleCompact: {
    fontSize: 10,
    color: colorTokens.gray[600],
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  meta: {
    fontSize: 9,
    color: colorTokens.gray[500],
  },
  metaCompact: {
    fontSize: 7,
    color: colorTokens.gray[500],
  },

  // Situation Section Styles
  situationSection: {
    marginBottom: 14,
    pageBreakInside: "avoid",
  },
  situationSectionCompact: {
    marginBottom: 10,
    pageBreakInside: "avoid",
  },
  situationHeader: {
    backgroundColor: colorTokens.blue[600],
    padding: 6,
    marginBottom: 6,
    borderRadius: 3,
  },
  situationHeaderCompact: {
    backgroundColor: colorTokens.blue[600],
    padding: 4,
    marginBottom: 4,
    borderRadius: 2,
  },
  situationTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  situationTitleCompact: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  situationDescription: {
    fontSize: 8,
    color: colorTokens.gray[100],
    marginTop: 2,
  },
  situationDescriptionCompact: {
    fontSize: 6,
    color: colorTokens.gray[100],
    marginTop: 1,
  },

  // Play Item Styles
  playItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    padding: 5,
    backgroundColor: colorTokens.gray[50],
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: colorTokens.blue[500],
  },
  playItemCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    padding: 3,
    backgroundColor: colorTokens.gray[50],
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colorTokens.blue[500],
  },
  priorityBadge: {
    width: 20,
    height: 20,
    backgroundColor: colorTokens.blue[700],
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  priorityBadgeCompact: {
    width: 16,
    height: 16,
    backgroundColor: colorTokens.blue[700],
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  priorityTextCompact: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
  },
  playContent: {
    flex: 1,
  },
  playName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colorTokens.gray[900],
    marginBottom: 2,
  },
  playNameCompact: {
    fontSize: 8,
    fontWeight: "bold",
    color: colorTokens.gray[900],
    marginBottom: 1,
  },
  playDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  playDetailsCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  playDetailBadge: {
    backgroundColor: colorTokens.gray[200],
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  playDetailBadgeCompact: {
    backgroundColor: colorTokens.gray[200],
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  playDetailText: {
    fontSize: 8,
    color: colorTokens.gray[700],
  },
  playDetailTextCompact: {
    fontSize: 6,
    color: colorTokens.gray[700],
  },
  wristbandBadge: {
    backgroundColor: colorTokens.purple[200],
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colorTokens.purple[400],
  },
  wristbandBadgeCompact: {
    backgroundColor: colorTokens.purple[200],
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colorTokens.purple[400],
  },
  wristbandText: {
    fontSize: 8,
    fontWeight: "bold",
    color: colorTokens.purple[900],
  },
  wristbandTextCompact: {
    fontSize: 6,
    fontWeight: "bold",
    color: colorTokens.purple[900],
  },

  // Empty State
  emptyState: {
    padding: 8,
    textAlign: "center",
    color: colorTokens.gray[400],
    fontSize: 9,
    fontStyle: "italic",
  },
  emptyStateCompact: {
    padding: 5,
    textAlign: "center",
    color: colorTokens.gray[400],
    fontSize: 7,
    fontStyle: "italic",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    color: colorTokens.gray[400],
    fontSize: 8,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colorTokens.gray[200],
    paddingTop: 8,
  },
  footerCompact: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    textAlign: "center",
    color: colorTokens.gray[400],
    fontSize: 6,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colorTokens.gray[200],
    paddingTop: 5,
  },
});

interface GamePlanPDFProps {
  gamePlan: GamePlan;
  format?: GamePlanPDFFormat;
}

export const GamePlanPDF: React.FC<GamePlanPDFProps> = ({
  gamePlan,
  format = "call-sheet",
}) => {
  const isCompact = format === "compact";
  const allSituations = getAllBillickSituations();

  // Get situation config for a situation
  const getSituationConfig = (
    situationType: string
  ): BillickSituationConfig | undefined => {
    return allSituations.find((s) => s.type === situationType);
  };

  // Format date helper
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get total play count
  const totalPlays = gamePlan.situations.reduce(
    (sum, situation) => sum + situation.plays.length,
    0
  );

  // Dynamic styles based on format
  const pageStyle = isCompact ? styles.pageCompact : styles.page;
  const headerStyle = isCompact ? styles.headerCompact : styles.header;
  const titleStyle = isCompact ? styles.titleCompact : styles.title;
  const subtitleStyle = isCompact ? styles.subtitleCompact : styles.subtitle;
  const metaStyle = isCompact ? styles.metaCompact : styles.meta;
  const situationSectionStyle = isCompact
    ? styles.situationSectionCompact
    : styles.situationSection;
  const situationHeaderStyle = isCompact
    ? styles.situationHeaderCompact
    : styles.situationHeader;
  const situationTitleStyle = isCompact
    ? styles.situationTitleCompact
    : styles.situationTitle;
  const situationDescriptionStyle = isCompact
    ? styles.situationDescriptionCompact
    : styles.situationDescription;
  const playItemStyle = isCompact ? styles.playItemCompact : styles.playItem;
  const priorityBadgeStyle = isCompact
    ? styles.priorityBadgeCompact
    : styles.priorityBadge;
  const priorityTextStyle = isCompact
    ? styles.priorityTextCompact
    : styles.priorityText;
  const playNameStyle = isCompact ? styles.playNameCompact : styles.playName;
  const playDetailsStyle = isCompact
    ? styles.playDetailsCompact
    : styles.playDetails;
  const playDetailBadgeStyle = isCompact
    ? styles.playDetailBadgeCompact
    : styles.playDetailBadge;
  const playDetailTextStyle = isCompact
    ? styles.playDetailTextCompact
    : styles.playDetailText;
  const wristbandBadgeStyle = isCompact
    ? styles.wristbandBadgeCompact
    : styles.wristbandBadge;
  const wristbandTextStyle = isCompact
    ? styles.wristbandTextCompact
    : styles.wristbandText;
  const emptyStateStyle = isCompact
    ? styles.emptyStateCompact
    : styles.emptyState;
  const footerStyle = isCompact ? styles.footerCompact : styles.footer;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        {/* Header */}
        <View style={headerStyle}>
          <Text style={titleStyle}>{gamePlan.name}</Text>
          <Text style={subtitleStyle}>vs {gamePlan.opponent}</Text>
          <View style={styles.metaRow}>
            <Text style={metaStyle}>
              {gamePlan.gameDate ? formatDate(gamePlan.gameDate) : "Date TBD"}
            </Text>
            <Text style={metaStyle}>
              {gamePlan.gameLocation || "Location TBD"}
            </Text>
            <Text style={metaStyle}>{totalPlays} total plays</Text>
          </View>
        </View>

        {/* Situations */}
        {gamePlan.situations.map((situation) => {
          const config = getSituationConfig(situation.situationType);
          if (!config) return null;

          // Only show situations with plays (or all in detailed mode)
          if (situation.plays.length === 0 && format !== "detailed")
            return null;

          return (
            <View key={situation.id} style={situationSectionStyle} wrap={false}>
              {/* Situation Header */}
              <View style={situationHeaderStyle}>
                <Text style={situationTitleStyle}>
                  {config.label} ({situation.plays.length} plays)
                </Text>
                {format === "detailed" && (
                  <Text style={situationDescriptionStyle}>
                    {config.description}
                  </Text>
                )}
              </View>

              {/* Plays */}
              {situation.plays.length === 0 ? (
                <Text style={emptyStateStyle}>No plays assigned</Text>
              ) : (
                situation.plays
                  .sort((a, b) => a.priority - b.priority)
                  .map((play) => (
                    <View key={play.id} style={playItemStyle}>
                      {/* Priority Badge */}
                      <View style={priorityBadgeStyle}>
                        <Text style={priorityTextStyle}>{play.priority}</Text>
                      </View>

                      {/* Play Content */}
                      <View style={styles.playContent}>
                        <Text style={playNameStyle}>{play.playName}</Text>
                        <View style={playDetailsStyle}>
                          {play.formation && (
                            <View style={playDetailBadgeStyle}>
                              <Text style={playDetailTextStyle}>
                                {play.formation}
                              </Text>
                            </View>
                          )}
                          {play.personnel && (
                            <View style={playDetailBadgeStyle}>
                              <Text style={playDetailTextStyle}>
                                {play.personnel}
                              </Text>
                            </View>
                          )}
                          {play.wristbandNumber && (
                            <View style={wristbandBadgeStyle}>
                              <Text style={wristbandTextStyle}>
                                #{play.wristbandNumber}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={footerStyle}>
          <Text>
            Generated by BoxCall • {new Date().toLocaleDateString()} • Billick
            Situational Method
          </Text>
        </View>
      </Page>
    </Document>
  );
};
