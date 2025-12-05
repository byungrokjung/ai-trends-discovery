import { supabase } from './supabase';

// Products 관련 서비스
export const productsService = {
  // 최신 제품 가져오기
  async getLatestProducts(limit = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data;
  },

  // 오늘의 제품 가져오기
  async getTodayProducts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today products:', error);
      throw error;
    }

    return data;
  },

  // 카테고리별 제품 가져오기
  async getProductsByCategory(category) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return data;
  },

  // 제품 상세 정보 가져오기
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  },

  // 인기 제품 가져오기
  async getPopularProducts(limit = 5) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular products:', error);
      throw error;
    }

    return data;
  },

  // 메이커와 함께 제품 가져오기
  async getProductsWithMakers(limit = 10) {
    try {
      // products 데이터 가져오기
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      console.log('Products 데이터:', products?.length, '개');

      // products가 있고 maker_id 필드가 있는 경우 makers 정보 별도로 가져오기
      if (products && products.length > 0) {
        // maker_id가 있는 제품들의 ID 수집
        const makerIds = [...new Set(products
          .map(p => p.maker_id)
          .filter(id => id != null))];

        if (makerIds.length > 0) {
          // makers 정보 가져오기
          const { data: makers, error: makersError } = await supabase
            .from('makers')
            .select('*')
            .in('id', makerIds);

          if (!makersError && makers) {
            // makers 정보를 맵으로 변환
            const makersMap = makers.reduce((acc, maker) => {
              acc[maker.id] = maker;
              return acc;
            }, {});

            // products에 maker 정보 추가
            return products.map(product => ({
              ...product,
              makers: product.maker_id ? makersMap[product.maker_id] : null
            }));
          }
        }
      }

      return products || [];
    } catch (error) {
      console.error('Error in getProductsWithMakers:', error);
      // 에러가 발생해도 기본 products 데이터 반환
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return data || [];
    }
  }
};

// Makers 관련 서비스
export const makersService = {
  // 모든 메이커 가져오기
  async getAllMakers() {
    const { data, error } = await supabase
      .from('makers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching makers:', error);
      throw error;
    }

    return data;
  },

  // 메이커 상세 정보 가져오기
  async getMakerById(id) {
    const { data, error } = await supabase
      .from('makers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching maker:', error);
      throw error;
    }

    return data;
  },

  // 메이커의 제품들 가져오기
  async getMakerProducts(makerId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('maker_id', makerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maker products:', error);
      throw error;
    }

    return data;
  }
};