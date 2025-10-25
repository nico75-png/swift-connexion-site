import { useEffect, useMemo, useRef } from "react";

const ActivityChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<any>(null);

  const chartData = useMemo(
    () => ({
      categories: ["J-30", "J-24", "J-18", "J-12", "J-6", "Aujourd'hui"],
      series: [
        {
          name: "Commandes",
          data: [32, 38, 45, 41, 52, 58],
        },
        {
          name: "Livraisons",
          data: [28, 34, 40, 39, 50, 55],
        },
      ],
    }),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const loadChart = async () => {
      const ApexCharts = (await import("https://esm.sh/apexcharts@3.45.1")).default as any;

      if (!isMounted || !chartRef.current) {
        return;
      }

      const options = {
        chart: {
          type: "area",
          height: 320,
          toolbar: { show: false },
          animations: { easing: "easeinout", speed: 800 },
        },
        colors: ["#f97316", "#0ea5e9"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: "#e2e8f0",
          strokeDashArray: 4,
          yaxis: { lines: { show: true } },
        },
        xaxis: {
          categories: chartData.categories,
          labels: {
            style: {
              colors: "#475569",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#475569",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            },
          },
        },
        legend: {
          position: "top" as const,
          horizontalAlign: "left" as const,
          labels: { colors: "#1e293b" },
          fontSize: "12px",
        },
        tooltip: {
          theme: "light",
          y: {
            formatter: (value: number) => `${value} courses`,
          },
        },
        series: chartData.series,
      };

      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    };

    loadChart();

    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Activité des 30 derniers jours</h2>
        <p className="text-sm text-slate-500">Projection basée sur des données simulées.</p>
      </header>
      <div ref={chartRef} className="h-[300px] w-full" aria-hidden="true" />
    </section>
  );
};

export default ActivityChart;
