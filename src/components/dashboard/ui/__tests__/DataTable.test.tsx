import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import DataTable, { type DataTableColumn } from "../DataTable";

type Row = { id: string; label: string; amount: number };

const columns: Array<DataTableColumn<Row>> = [
  { key: "label", header: "Nom", sortable: true },
  { key: "amount", header: "Montant", sortable: true, align: "right" },
];

describe("DataTable", () => {
  it("sorts rows when header is clicked", async () => {
    render(
      <DataTable
        data={[
          { id: "1", label: "B", amount: 10 },
          { id: "2", label: "A", amount: 20 },
        ]}
        columns={columns}
        caption="Test"
        pageSize={10}
      />,
    );

    const headerButton = within(screen.getByRole("columnheader", { name: /nom/i })).getByRole("button");
    const user = userEvent.setup();
    await user.click(headerButton);
    const rows = screen.getAllByRole("row").slice(1); // skip header
    expect(within(rows[0]).getByText("A")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(
      <DataTable data={[]} columns={columns} caption="Vide" emptyState={{ title: "Aucune donnée", description: "Rien" }} />,
    );

    expect(screen.getByText("Aucune donnée")).toBeVisible();
  });
});
