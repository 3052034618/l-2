import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';

interface ProductItemProps {
  product: Product;
  type?: 'default' | 'outOfStock' | 'nearExpiry';
  onClick?: () => void;
  showStock?: boolean;
}

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  type = 'default',
  onClick,
  showStock = true
}) => {
  const getStockStatus = () => {
    if (product.stock <= 0) return 'outOfStock';
    if (product.stock < product.minStock) return 'lowStock';
    return 'normal';
  };

  const getExpiryStatus = () => {
    if (!product.expireDate) return '';
    const now = new Date();
    const expire = new Date(product.expireDate);
    const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'urgent';
    if (diffDays <= 7) return 'near';
    return 'normal';
  };

  const stockStatus = getStockStatus();
  const expiryStatus = getExpiryStatus();

  return (
    <View className={styles.productItem} onClick={onClick}>
      <Image
        className={styles.productImage}
        src={product.image}
        mode="aspectFill"
      />
      <View className={styles.productInfo}>
        <Text className={styles.productName}>{product.name}</Text>
        <Text className={styles.productCategory}>{product.category}</Text>
        <View className={styles.productBottom}>
          <Text className={styles.productPrice}>¥{product.price.toFixed(2)}</Text>
          {showStock && (
            <View className={classnames(styles.stockTag, styles[stockStatus])}>
              <Text>{product.stock}{product.unit}</Text>
            </View>
          )}
          {type === 'nearExpiry' && product.expireDate && (
            <View className={classnames(styles.expiryTag, styles[expiryStatus])}>
              <Text>{product.expireDate}到期</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProductItem;
