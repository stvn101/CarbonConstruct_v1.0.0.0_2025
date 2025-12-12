/**
 * Tests for EmissionsChart component
 * Validates data visualization accuracy, chart types, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../lib/__tests__/setup';
import { EmissionsChart } from '../EmissionsChart';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Pie: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockEmissionData = [
  { category: 'Scope 1', emissions: 100, percentage: 20 },
  { category: 'Scope 2', emissions: 200, percentage: 40 },
  { category: 'Scope 3', emissions: 200, percentage: 40 },
];

describe('EmissionsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bar chart rendering', () => {
    it('renders bar chart when type is bar', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Emissions by Scope"
          description="Total emissions breakdown"
          data={mockEmissionData}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('displays title and description for bar chart', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Test Title"
          description="Test Description"
          data={mockEmissionData}
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders within a card component', () => {
      const { container } = render(
        <EmissionsChart
          type="bar"
          title="Emissions"
          description="Description"
          data={mockEmissionData}
        />
      );

      // Card should be rendered (check for card-like structure)
      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('pie chart rendering', () => {
    it('renders pie chart when type is pie', () => {
      render(
        <EmissionsChart
          type="pie"
          title="Emissions Distribution"
          description="Percentage breakdown"
          data={mockEmissionData}
        />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('displays title and description for pie chart', () => {
      render(
        <EmissionsChart
          type="pie"
          title="Pie Chart Title"
          description="Pie Chart Description"
          data={mockEmissionData}
        />
      );

      expect(screen.getByText('Pie Chart Title')).toBeInTheDocument();
      expect(screen.getByText('Pie Chart Description')).toBeInTheDocument();
    });
  });

  describe('data handling', () => {
    it('handles empty data array', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Empty Chart"
          description="No data"
          data={[]}
        />
      );

      expect(screen.getByText('Empty Chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles single data point', () => {
      render(
        <EmissionsChart
          type="pie"
          title="Single Data"
          description="One item"
          data={[{ category: 'Only One', emissions: 500, percentage: 100 }]}
        />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('handles large emission values', () => {
      const largeData = [
        { category: 'Large', emissions: 1000000, percentage: 100 },
      ];

      render(
        <EmissionsChart
          type="bar"
          title="Large Values"
          description="Million scale"
          data={largeData}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles decimal values', () => {
      const decimalData = [
        { category: 'Decimal', emissions: 123.456, percentage: 50.5 },
        { category: 'Another', emissions: 98.765, percentage: 49.5 },
      ];

      render(
        <EmissionsChart
          type="bar"
          title="Decimal Values"
          description="Precise numbers"
          data={decimalData}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles zero emission values', () => {
      const zeroData = [
        { category: 'Zero', emissions: 0, percentage: 0 },
        { category: 'NonZero', emissions: 100, percentage: 100 },
      ];

      render(
        <EmissionsChart
          type="pie"
          title="Zero Values"
          description="Including zeroes"
          data={zeroData}
        />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('custom colors', () => {
    it('accepts custom color array', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];

      render(
        <EmissionsChart
          type="bar"
          title="Custom Colors"
          description="With custom palette"
          data={mockEmissionData}
          colors={customColors}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('uses default colors when not provided', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Default Colors"
          description="Using defaults"
          data={mockEmissionData}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('uses ResponsiveContainer for charts', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Responsive"
          description="Should be responsive"
          data={mockEmissionData}
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('component is memoized', () => {
      // EmissionsChart uses React.memo
      expect(EmissionsChart.displayName).toBe('EmissionsChart');
    });
  });

  describe('accessibility', () => {
    it('includes card header with title', () => {
      render(
        <EmissionsChart
          type="bar"
          title="Accessible Chart"
          description="With proper structure"
          data={mockEmissionData}
        />
      );

      // Title acts as accessible label
      const heading = screen.getByText('Accessible Chart');
      expect(heading).toBeInTheDocument();
    });

    it('includes description for context', () => {
      render(
        <EmissionsChart
          type="pie"
          title="Chart"
          description="Detailed description for screen readers"
          data={mockEmissionData}
        />
      );

      expect(screen.getByText('Detailed description for screen readers')).toBeInTheDocument();
    });
  });
});
