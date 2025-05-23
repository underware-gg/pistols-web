import React, { ReactNode } from 'react'
import { Grid, Progress } from 'semantic-ui-react'
import { useAspectSize } from '@/hooks/useAspectSize';

const Row = Grid.Row
const Col = Grid.Column

interface ProgressBarProps {
  label?: ReactNode | null;
  className?: string | null;
  disabled?: boolean;
  warning?: boolean;
  negative?: boolean;
  cold?: boolean;
  neutral?: boolean;
  percent?: number | null;
  value?: number | null;
  total?: number | null;
  width?: number | null;
  height?: number | null;
  hideValue?: boolean;
}

export default function ProgressBar({
  label = null,
  className = null,
  disabled = false,
  warning = false,
  negative = false,
  cold = false,
  neutral = false,
  percent = null,
  value = null,
  total = null,
  width = null,
  height = null,
  hideValue = false,
}: ProgressBarProps) {
  const { aspectWidth } = useAspectSize();

  const _disabled = (disabled || (value === null && !percent))
  const _className = `NoMargin ${className}`

  return (
    <Grid verticalAlign='middle' style={{ width: aspectWidth(width ?? 10), height: aspectWidth(height ?? 2), margin: 0 }}>
      {label &&
        <Row style={{ width: '100%' }}>
          <Col textAlign='left' className='TitleCase NoMargin' style={{ height: '100%' }}>
            {label}
          </Col>
        </Row>
      }
      <Row style={{ width: '100%', height: '100%' }}>
        <Col textAlign='left' className='Relative' style={{ height: '100%' }}>
          <Progress
            disabled={_disabled}
            value={value ?? 0}
            progress={!_disabled && value !== null && !hideValue ? 'value' : false}
            total={total ?? 100}
            className={_className + (hideValue ? ' hide-value' : '')}
            color={_disabled ? 'grey' : (neutral ? 'grey' : (cold ? 'teal' : undefined))}
            warning={!_disabled && warning}
            error={!_disabled && negative}
            style={{ width: '100%', height: '100%', margin: 0, border: '1px solid rgba(0, 0, 0, 0.2)', boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.8)' }}
          />
        </Col>
      </Row>
    </Grid>
  )
}
