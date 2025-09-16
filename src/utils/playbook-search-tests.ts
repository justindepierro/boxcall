/**
 * Playbook Search & Filter Test Suite
 * Comprehensive testing for database integration
 */

export interface SearchTestCase {
  name: string;
  searchQuery: string;
  expectedMatches: number;
  description: string;
}

export interface FilterTestCase {
  name: string;
  filters: {
    formation?: string;
    playType?: string;
  };
  expectedResults: number;
  description: string;
}

export const createSearchTests = (
  plays: Array<{
    play_name: string;
    formation: string;
    p_type: string;
    notes?: string;
  }>
) => {
  const tests: SearchTestCase[] = [];

  if (plays.length === 0) return tests;

  // Get sample data for tests
  const samplePlay = plays[0];
  const formations = [...new Set(plays.map((p) => p.formation))];

  // Test 1: Search by play name
  if (samplePlay.play_name) {
    const nameWords = samplePlay.play_name.split(" ");
    if (nameWords.length > 0) {
      tests.push({
        name: "search-by-name",
        searchQuery: nameWords[0].toLowerCase(),
        expectedMatches: plays.filter((p) =>
          p.play_name.toLowerCase().includes(nameWords[0].toLowerCase())
        ).length,
        description: `Search for plays containing "${nameWords[0]}"`,
      });
    }
  }

  // Test 2: Search by formation
  if (formations.length > 0) {
    tests.push({
      name: "search-by-formation",
      searchQuery: formations[0].toLowerCase(),
      expectedMatches: plays.filter((p) =>
        p.formation.toLowerCase().includes(formations[0].toLowerCase())
      ).length,
      description: `Search for plays in "${formations[0]}" formation`,
    });
  }

  // Test 3: Empty search (should return all)
  tests.push({
    name: "empty-search",
    searchQuery: "",
    expectedMatches: plays.length,
    description: "Empty search should return all plays",
  });

  return tests;
};

export const createFilterTests = (
  plays: Array<{ formation: string; p_type: string }>
) => {
  const tests: FilterTestCase[] = [];

  if (plays.length === 0) return tests;

  const formations = [...new Set(plays.map((p) => p.formation))];
  const playTypes = [...new Set(plays.map((p) => p.p_type))];

  // Test 1: Filter by formation
  if (formations.length > 0) {
    tests.push({
      name: "filter-by-formation",
      filters: { formation: formations[0] },
      expectedResults: plays.filter((p) => p.formation === formations[0])
        .length,
      description: `Filter by formation: ${formations[0]}`,
    });
  }

  // Test 2: Filter by play type
  if (playTypes.length > 0) {
    tests.push({
      name: "filter-by-play-type",
      filters: { playType: playTypes[0] },
      expectedResults: plays.filter((p) => p.p_type === playTypes[0]).length,
      description: `Filter by play type: ${playTypes[0]}`,
    });
  }

  // Test 3: Combined filters
  if (formations.length > 0 && playTypes.length > 0) {
    tests.push({
      name: "combined-filters",
      filters: { formation: formations[0], playType: playTypes[0] },
      expectedResults: plays.filter(
        (p) => p.formation === formations[0] && p.p_type === playTypes[0]
      ).length,
      description: `Combined filter: ${formations[0]} + ${playTypes[0]}`,
    });
  }

  return tests;
};

export const runSearchTests = (
  tests: SearchTestCase[],
  searchFunction: (query: string) => number
) => {
  console.info("🔍 Search Function Tests");
  const results = tests.map((test) => {
    const actualResults = searchFunction(test.searchQuery);
    const passed = actualResults === test.expectedMatches;

    console.info(
      `${passed ? "✅" : "❌"} ${test.name}: ${test.description}`,
      `Expected: ${test.expectedMatches}, Got: ${actualResults}`
    );

    return { ...test, passed, actualResults };
  });

  const passedCount = results.filter((r) => r.passed).length;
  console.info(`📊 Search Tests: ${passedCount}/${tests.length} passed`);
  // end group

  return results;
};

export const runFilterTests = (
  tests: FilterTestCase[],
  filterFunction: (filters: { formation?: string; playType?: string }) => number
) => {
  console.info("🏷️ Filter Function Tests");
  const results = tests.map((test) => {
    const actualResults = filterFunction(test.filters);
    const passed = actualResults === test.expectedResults;

    console.info(
      `${passed ? "✅" : "❌"} ${test.name}: ${test.description}`,
      `Expected: ${test.expectedResults}, Got: ${actualResults}`
    );

    return { ...test, passed, actualResults };
  });

  const passedCount = results.filter((r) => r.passed).length;
  console.info(`📊 Filter Tests: ${passedCount}/${tests.length} passed`);
  // end group

  return results;
};
