import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  extra?: string;
  onClickExtra?: () => void;
  showArrow?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  extra,
  onClickExtra,
  showArrow = false
}) => {
  return (
    <View className={styles.sectionHeader}>
      <Text className={styles.title}>{title}</Text>
      {extra && (
        <View className={styles.extra} onClick={onClickExtra}>
          <Text className={styles.extraText}>{extra}</Text>
          {showArrow && <Text className={styles.arrow}>›</Text>}
        </View>
      )}
    </View>
  );
};

export default SectionHeader;
