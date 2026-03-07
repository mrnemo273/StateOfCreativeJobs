import SectionLabel from './SectionLabel';
import DataValue from './DataValue';
import TrendBadge from './TrendBadge';
import Sparkline from './Sparkline';

type Props = {
  label: string;
  value: string;
  trend: number;
  trendFormat?: 'percent' | 'currency' | 'number';
  sublabel?: string;
  sparklineData?: { date: string; value: number }[];
  sparklineColor?: string;
};

export default function StatCard({
  label,
  value,
  trend,
  trendFormat,
  sublabel,
  sparklineData,
  sparklineColor,
}: Props) {
  return (
    <div className="border border-light p-6">
      <SectionLabel>{label}</SectionLabel>
      <DataValue value={value} className="text-data-lg font-display" />
      {sublabel && (
        <span className="text-label-md text-mid font-mono uppercase tracking-widest block mt-1">
          {sublabel}
        </span>
      )}
      {trend !== 0 && (
        <div className="mt-2">
          <TrendBadge value={trend} format={trendFormat} />
        </div>
      )}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4">
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
      )}
    </div>
  );
}
