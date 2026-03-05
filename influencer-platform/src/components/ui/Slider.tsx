'use client';

import React, { useState } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  defaultValue: number | [number, number];
  value?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  range?: boolean;
  tipFormatter?: (value: number | undefined) => React.ReactNode;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  defaultValue,
  value,
  onChange,
  range = false,
  tipFormatter = (value) => value,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipPos, setTooltipPos] = useState<number | [number, number]>(
    value || defaultValue
  );
  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    value || defaultValue
  );

  // Custom styles for various parts of the slider
  const sliderStyles = {
    container: 'relative w-full h-6 pt-2 pb-6',
    track:
      'absolute h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full top-3',
    activeTrack: 'absolute h-2 bg-brand-primary rounded-full top-3',
    thumb:
      'absolute w-5 h-5 bg-brand-primary rounded-full shadow focus:outline-none -translate-x-1/2 top-1 cursor-pointer',
    tooltip:
      'absolute -top-8 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (range && Array.isArray(internalValue)) {
      // For range sliders, we need to update the appropriate thumb
      const [min, max] = internalValue;
      const isMinChange = Math.abs(newValue - min) < Math.abs(newValue - max);
      const newValues = isMinChange ? [newValue, max] : [min, newValue];
      setInternalValue(newValues as [number, number]);
      setTooltipPos(newValues as [number, number]);
      onChange?.(newValues as [number, number]);
    } else {
      setInternalValue(newValue);
      setTooltipPos(newValue);
      onChange?.(newValue);
    }
  };

  const handleMouseDown = () => {
    setShowTooltip(true);
  };

  const handleMouseUp = () => {
    setTimeout(() => setShowTooltip(false), 1000);
  };

  const renderTooltip = () => {
    if (!showTooltip) return null;

    if (Array.isArray(tooltipPos)) {
      return (
        <>
          <div
            className={sliderStyles.tooltip}
            style={{ left: `${((tooltipPos[0] - min) / (max - min)) * 100}%` }}
          >
            {tipFormatter?.(tooltipPos[0])}
          </div>
          <div
            className={sliderStyles.tooltip}
            style={{ left: `${((tooltipPos[1] - min) / (max - min)) * 100}%` }}
          >
            {tipFormatter?.(tooltipPos[1])}
          </div>
        </>
      );
    }

    return (
      <div
        className={sliderStyles.tooltip}
        style={{
          left: `${(((tooltipPos as number) - min) / (max - min)) * 100}%`,
        }}
      >
        {tipFormatter?.(tooltipPos as number)}
      </div>
    );
  };

  const renderRangeSlider = () => {
    if (!range) return null;

    const [minVal, maxVal] = Array.isArray(internalValue)
      ? internalValue
      : [min, internalValue as number];

    // Calculate the left and width for the active track
    const leftPercent = ((minVal - min) / (max - min)) * 100;
    const widthPercent = ((maxVal - minVal) / (max - min)) * 100;

    return (
      <>
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className='absolute w-full opacity-0 cursor-pointer z-10 h-2 top-3'
        />
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className='absolute w-full opacity-0 cursor-pointer z-10 h-2 top-3'
        />
        <div
          className={sliderStyles.activeTrack}
          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
        />
        <div
          className={sliderStyles.thumb}
          style={{ left: `${leftPercent}%` }}
        />
        <div
          className={sliderStyles.thumb}
          style={{ left: `${leftPercent + widthPercent}%` }}
        />
      </>
    );
  };

  const renderSingleSlider = () => {
    if (range) return null;

    const value = internalValue as number;
    const percent = ((value - min) / (max - min)) * 100;

    return (
      <>
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className='absolute w-full opacity-0 cursor-pointer z-10 h-2 top-3'
        />
        <div
          className={sliderStyles.activeTrack}
          style={{ width: `${percent}%` }}
        />
        <div className={sliderStyles.thumb} style={{ left: `${percent}%` }} />
      </>
    );
  };

  return (
    <div className={sliderStyles.container}>
      {renderTooltip()}
      <div className={sliderStyles.track} />
      {range ? renderRangeSlider() : renderSingleSlider()}
    </div>
  );
};

export default Slider;
