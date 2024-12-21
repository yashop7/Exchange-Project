import {
    ColorType,
    createChart as createLightWeightChart,
    CrosshairMode,
    ISeriesApi,
    UTCTimestamp,
  } from "lightweight-charts";
  
  export class LineChartManager {
    private candleSeries: ISeriesApi<"Line">;
    private lastUpdateTime: number = 0;
    private chart: any;

    constructor(
      ref: any,
      initialData: any[],
      layout: { background: string; color: string },
      lineColour: string
    ) {
      const chart = createLightWeightChart(ref, {
        autoSize: true,
        overlayPriceScales: {
          ticksVisible: true,
          borderVisible: true,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
      rightPriceScale: {
        visible: false,
        ticksVisible: false,
        entireTextOnly: false,
      },
      timeScale: {
        visible: false,  
        borderVisible: false,
      },
        grid: {
          horzLines: {
            visible: false,
          },
          vertLines: {
            visible: false,
          },
        },
        layout: {
          background: {
            type: ColorType.Solid,
            color: layout.background,
          },
          textColor: "transparent",
        },
      });
      this.chart = chart;
      this.candleSeries = chart.addLineSeries({ color: lineColour});
  
      this.candleSeries.setData(
        initialData.map((data) => ({
          ...data,
          time: (data.timestamp / 1000) as UTCTimestamp,
        }))
      );
    }
  
  
    // public update(updatedPrice: any) {
    //   if (!this.lastUpdateTime) {
    //     this.lastUpdateTime = new Date().getTime();
    //   }
  
    //   this.candleSeries.update({
    //     time: (this.lastUpdateTime / 1000) as UTCTimestamp,
    //     close: updatedPrice.close,
    //     low: updatedPrice.low,
    //     high: updatedPrice.high,
    //     open: updatedPrice.open,
    //   });
  
    //   if (updatedPrice.newCandleInitiated) {
    //     this.lastUpdateTime = updatedPrice.time;
    //   }
    // }
  
  
  
    public destroy() {
      this.chart.remove();
    }
  }
  