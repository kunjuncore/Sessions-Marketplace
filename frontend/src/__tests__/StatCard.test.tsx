import { render, screen } from "@testing-library/react";
import StatCard from "@/components/ui/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Revenue" value="$100" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<StatCard label="Users" value="50" sub="+5 this week" />);
    expect(screen.getByText("+5 this week")).toBeInTheDocument();
  });

  it("applies accent classes", () => {
    const { container } = render(<StatCard label="Total" value="99" accent="green" />);
    const valueEl = container.querySelector(".text-green-600");
    expect(valueEl).toBeInTheDocument();
  });
});
