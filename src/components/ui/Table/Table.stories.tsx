import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Table } from "./Table";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A comprehensive table component with sorting, filtering, pagination, selection, and customizable columns.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    striped: {
      control: "boolean",
    },
    selectable: {
      control: "boolean",
    },
    searchable: {
      control: "boolean",
    },
    pagination: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// Sample data for stories
const samplePlayers = [
  {
    id: "1",
    name: "John Doe",
    position: "QB",
    jerseyNumber: 12,
    year: "Senior",
    height: "6'2\"",
    weight: 185,
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    position: "RB",
    jerseyNumber: 28,
    year: "Junior",
    height: "5'8\"",
    weight: 165,
    status: "active",
  },
  {
    id: "3",
    name: "Mike Johnson",
    position: "WR",
    jerseyNumber: 88,
    year: "Sophomore",
    height: "6'0\"",
    weight: 175,
    status: "injured",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    position: "OL",
    jerseyNumber: 75,
    year: "Senior",
    height: "6'4\"",
    weight: 285,
    status: "active",
  },
  {
    id: "5",
    name: "Tom Brown",
    position: "DL",
    jerseyNumber: 90,
    year: "Junior",
    height: "6'3\"",
    weight: 265,
    status: "suspended",
  },
];

const playerColumns = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name" as keyof (typeof samplePlayers)[0],
    sortable: true,
    filterable: true,
  },
  {
    id: "position",
    header: "Position",
    accessorKey: "position" as keyof (typeof samplePlayers)[0],
    sortable: true,
    filterable: true,
  },
  {
    id: "jerseyNumber",
    header: "Jersey #",
    accessorKey: "jerseyNumber" as keyof (typeof samplePlayers)[0],
    sortable: true,
    align: "center" as const,
  },
  {
    id: "year",
    header: "Year",
    accessorKey: "year" as keyof (typeof samplePlayers)[0],
    sortable: true,
  },
  {
    id: "height",
    header: "Height",
    accessorKey: "height" as keyof (typeof samplePlayers)[0],
    sortable: false,
  },
  {
    id: "weight",
    header: "Weight",
    accessorKey: "weight" as keyof (typeof samplePlayers)[0],
    sortable: true,
    align: "right" as const,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status" as keyof (typeof samplePlayers)[0],
    cell: (value: unknown) => {
      const status = value as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "injured"
                ? "warning"
                : status === "suspended"
                  ? "danger"
                  : "neutral"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    sortable: true,
    filterable: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm">
          <Icon name="edit" size="sm" />
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="eye" size="sm" />
        </Button>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    columns: playerColumns,
    data: samplePlayers,
  },
};

export const Striped: Story = {
  args: {
    columns: playerColumns,
    data: samplePlayers,
    striped: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Table</h3>
        <Table columns={playerColumns} data={samplePlayers} size="sm" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Table (Default)</h3>
        <Table columns={playerColumns} data={samplePlayers} size="md" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Table</h3>
        <Table columns={playerColumns} data={samplePlayers} size="lg" />
      </div>
    </div>
  ),
};

export const Selectable: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-secondary mb-2">
            Selected: {selectedRows.length} row
            {selectedRows.length !== 1 ? "s" : ""}
          </p>
          <Table
            columns={playerColumns}
            data={samplePlayers}
            selectable={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
          />
        </div>
      </div>
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [globalFilter, setGlobalFilter] = useState("");

    return (
      <Table
        columns={playerColumns}
        data={samplePlayers}
        searchable={true}
        searchPlaceholder="Search players..."
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />
    );
  },
};

export const WithPagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);

    // Generate more sample data for pagination
    const morePlayers = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Player ${i + 1}`,
      position: ["QB", "RB", "WR", "OL", "DL", "LB", "DB"][i % 7],
      jerseyNumber: i + 1,
      year: ["Freshman", "Sophomore", "Junior", "Senior"][i % 4],
      height: `${5 + (i % 2)}'${10 + (i % 12)}"`,
      weight: 150 + (i % 100),
      status: ["active", "injured", "suspended"][i % 3],
    }));

    return (
      <Table
        columns={playerColumns}
        data={morePlayers}
        pagination={true}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={morePlayers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

export const Loading: Story = {
  args: {
    columns: playerColumns,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: playerColumns,
    data: [],
    emptyMessage: "No players found. Add some players to get started.",
  },
};

export const Sortable: Story = {
  render: () => {
    const [sortState, setSortState] = useState<
      { columnId: string; direction: "asc" | "desc" | null } | undefined
    >();

    return (
      <Table
        columns={playerColumns}
        data={samplePlayers}
        sortState={sortState}
        onSortChange={setSortState}
      />
    );
  },
};

export const CompleteExample: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sortState, setSortState] = useState<
      { columnId: string; direction: "asc" | "desc" | null } | undefined
    >();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Generate more comprehensive sample data
    const comprehensivePlayers = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Player ${i + 1}`,
      position: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"][
        i % 10
      ],
      jerseyNumber: i + 1,
      year: ["Freshman", "Sophomore", "Junior", "Senior"][i % 4],
      height: `${5 + (i % 2)}'${10 + (i % 12)}"`,
      weight: 150 + (i % 100),
      status: ["active", "injured", "suspended"][i % 3],
      gpa: (2.0 + (i % 3)).toFixed(1),
      tackles: Math.floor(Math.random() * 100),
    }));

    const comprehensiveColumns = [
      ...playerColumns.slice(0, -1), // Remove actions column
      {
        id: "gpa",
        header: "GPA",
        accessorKey: "gpa" as keyof (typeof comprehensivePlayers)[0],
        sortable: true,
        align: "right" as const,
      },
      {
        id: "tackles",
        header: "Tackles",
        accessorKey: "tackles" as keyof (typeof comprehensivePlayers)[0],
        sortable: true,
        align: "right" as const,
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" title="Edit">
              <Icon name="edit" size="sm" />
            </Button>
            <Button variant="ghost" size="sm" title="View">
              <Icon name="eye" size="sm" />
            </Button>
            <Button variant="ghost" size="sm" title="Delete">
              <Icon name="delete" size="sm" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Player Roster</h3>
            <p className="text-sm text-gray-600">
              {selectedRows.length} of {comprehensivePlayers.length} players
              selected
            </p>
          </div>
          <Button variant="primary">
            <Icon name="plus" size="sm" className="mr-2" />
            Add Player
          </Button>
        </div>

        <Table
          columns={comprehensiveColumns}
          data={comprehensivePlayers}
          striped={true}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          searchable={true}
          searchPlaceholder="Search players..."
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={comprehensivePlayers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          sortState={sortState}
          onSortChange={setSortState}
        />
      </div>
    );
  },
};
