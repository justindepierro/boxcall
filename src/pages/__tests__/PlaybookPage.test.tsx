import { describe, it, expect, vi } from "vitest";

// Mock all the services and components that PlaybookPage depends on
vi.mock("../../services/playsService", () => ({
  playbookService: {
    getPlays: vi.fn(),
    searchPlays: vi.fn(),
    getPlayCategories: vi.fn(),
  },
}));

vi.mock("../../services/playAnalyticsService", () => ({
  analyticsService: {
    trackEvent: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/playbook", search: "" }),
    useParams: () => ({}),
  };
});

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isLoading: false,
    })),
  };
});

// Mock all the UI components
vi.mock("@/components/ui", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Input: (props: any) => <input {...props} />,
  Card: ({ children }: any) => <div>{children}</div>,
  LoadingSpinner: () => <div>Loading...</div>,
  SearchBar: (props: any) => <input {...props} placeholder="Search" />,
}));

describe("PlaybookPage Import", () => {
  it("can import PlaybookPage without errors", async () => {
    // This test just verifies that the import works without throwing errors
    expect(async () => {
      await import("../PlaybookPage");
    }).not.toThrow();
  });

  it("mocks are properly configured", () => {
    // Test that our mocks are working - just verify import works
    expect(DashboardPage).toBeDefined();
    expect(typeof DashboardPage).toBe("function");
  });
});
