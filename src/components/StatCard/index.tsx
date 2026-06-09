import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  growth?: number;
  growthText?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  icon?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  growth,
  growthText,
  color = 'primary',
  onClick
}) => {
  const getGrowthText = () => {
    if (growthText) return growthText;
    if (growth === undefined) return '';
    const prefix = growth >= 0 ? '+' : '';
    return `${prefix}${(growth * 100).toFixed(1)}%`;
  };

  const getGrowthClass = () => {
    if (growth === undefined) return '';
    return growth >= 0 ? styles.growthUp : styles.growthDown;
  };

  return (
    <View
      className={classnames(styles.statCard, styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`])}
      onClick={onClick}
    >
      <View className={styles.cardHeader}>
        <Text className={styles.title}>{title}</Text>
        {growth !== undefined && (
          <View className={classnames(styles.growth, getGrowthClass())}>
            <Text>{getGrowthText()}</Text>
          </View>
        )}
      </View>
      <View className={styles.cardBody}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

export default StatCard;
