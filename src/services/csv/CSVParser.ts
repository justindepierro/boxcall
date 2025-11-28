/**
 * CSV Parser Service
 *
 * Handles low-level CSV parsing and row processing
 */

export class CSVParser {
  /**
   * Enhanced CSV line parsing that handles quotes and commas properly
   * Supports: "value with, comma", unquoted values, mixed quotes
   */
  static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ""
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator outside quotes
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
      i++;
    }

    // Add the last field
    result.push(current.trim());

    // Clean up quotes from field values
    return result.map((field) => {
      // Remove surrounding quotes and trim
      let cleaned = field.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned.trim();
    });
  }

  /**
   * Parse CSV content into lines, filtering empty lines
   */
  static parseCSVContent(csvContent: string): string[] {
    return csvContent
      .trim()
      .split("\n")
      .filter((line) => line.trim());
  }

  /**
   * Extract headers from first line of CSV
   */
  static extractHeaders(lines: string[]): string[] {
    if (lines.length === 0) return [];
    return this.parseCSVLine(lines[0]);
  }

  /**
   * Detect if a row is likely a header row based on content
   * Headers typically contain field names, not actual play data
   */
  static isHeaderRow(values: string[]): boolean {
    if (values.length === 0) return false;

    // Common header keywords that indicate a header row
    const headerKeywords = [
      'formation',
      'play_name',
      'play name',
      'playname',
      'p_type',
      'play_type',
      'play type',
      'personnel',
      'protection',
      'type',
      'name',
      'category',
      'notes',
      'description',
      'one_word_play',
      'audible',
      'key_player',
      'down',
      'distance',
      'field_position'
    ];

    // Check if any of the first few values match common header keywords
    const firstThreeValues = values.slice(0, 3).map(v => v.toLowerCase().trim());
    const matchCount = firstThreeValues.filter(val => 
      headerKeywords.some(keyword => val === keyword || val.includes(keyword))
    ).length;

    // If 2 or more of the first 3 values match header keywords, it's likely a header
    return matchCount >= 2;
  }

  /**
   * Map row values to field names using column mapping
   */
  static mapRowToFields(
    values: string[],
    headers: string[],
    columnMapping: Record<string, string>
  ): Record<string, string> {
    const rowData: Record<string, string> = {};

    headers.forEach((header, index) => {
      const fieldName = columnMapping[header] || header.toLowerCase().trim();
      const value = values[index]?.trim() || "";
      rowData[fieldName] = value;
    });

    return rowData;
  }
}
