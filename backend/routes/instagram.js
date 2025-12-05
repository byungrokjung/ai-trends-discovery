const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 직접 생성
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://txonxxwdwlyrihplfibo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b254eHdkd2x5cmlocGxmaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDcwNDgsImV4cCI6MjA3NDAyMzA0OH0.5ABsPoPaoTvQtNygm0ClllfVYfOCSD56swva8V58YB4',
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
);

// 인스타그램 포스트 목록 조회
router.get('/posts', async (req, res) => {
  try {
    console.log('📸 [instagram] Posts route accessed');
    console.log('Query params:', req.query);
    
    const { 
      limit = 20, 
      offset = 0, 
      username, 
      sortBy = 'scraped_at',
      media_type,
      min_likes,
      hashtag,
      dateRange = 7
    } = req.query;
    
    let query = supabase
      .from('instagram_posts')
      .select('*', { count: 'exact' });
    
    // 사용자명 필터 (실제 필드명: ownerUsername)
    if (username) {
      query = query.eq('ownerUsername', username);
    }
    
    // 미디어 타입 필터 (실제 필드명: type)
    if (media_type && media_type !== 'all') {
      const typeMapping = {
        'image': 'Image',
        'video': 'Video', 
        'carousel': 'Sidecar'
      };
      query = query.eq('type', typeMapping[media_type] || media_type);
    }
    
    // 최소 좋아요 수 필터 (실제 필드명: likesCount)
    if (min_likes) {
      query = query.gte('likesCount', parseInt(min_likes));
    }
    
    // 해시태그 필터 (caption에서 검색)
    if (hashtag) {
      query = query.ilike('caption', `%#${hashtag}%`);
    }
    
    // 날짜 범위 필터 (실제 필드명: timestamp)
    if (dateRange) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      query = query.gte('timestamp', daysAgo.toISOString());
    }
    
    // 정렬 (실제 필드명에 맞게)
    const sortMapping = {
      'like_count': 'likesCount',
      'comment_count': 'commentsCount', 
      'scraped_at': 'created_at',
      'ai_relevance_score': 'likesCount' // AI 점수 없으므로 좋아요 수로 대체
    };
    const actualSortField = sortMapping[sortBy] || 'created_at';
    query = query.order(actualSortField, { ascending: false });
    
    // 페이지네이션
    query = query.range(offset, offset + parseInt(limit) - 1);
    
    const { data, error, count } = await query;
    
    console.log('Query result:', { dataLength: data?.length, error, count });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('인스타그램 포스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 인스타그램 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const { dateRange = 7 } = req.query;
    
    // 최근 N일 데이터
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    
    const { data: postsData, error: postsError } = await supabase
      .from('instagram_posts')
      .select('*')
      .gte('timestamp', daysAgo.toISOString());
    
    if (postsError) throw postsError;
    
    // 통계 계산
    const stats = {
      totalPosts: postsData.length,
      totalLikes: postsData.reduce((sum, post) => sum + (post.likesCount || 0), 0),
      totalComments: postsData.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
      avgEngagement: 0,
      topHashtags: {},
      topAccounts: {},
      mediaTypeDistribution: {
        image: 0,
        video: 0,
        carousel: 0
      },
      sentimentAnalysis: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      dailyStats: {}
    };
    
    // 평균 참여율 계산
    if (stats.totalPosts > 0) {
      stats.avgEngagement = (stats.totalLikes + stats.totalComments) / stats.totalPosts;
    }
    
    // 데이터 분석
    postsData.forEach(post => {
      // 미디어 타입 분포 (실제 필드명: type)
      const mediaType = post.type ? post.type.toLowerCase() : 'image';
      stats.mediaTypeDistribution[mediaType] = 
        (stats.mediaTypeDistribution[mediaType] || 0) + 1;
      
      // 감정 분석
      if (post.sentiment) {
        stats.sentimentAnalysis[post.sentiment] = 
          (stats.sentimentAnalysis[post.sentiment] || 0) + 1;
      }
      
      // 해시태그 통계 (caption에서 추출)
      if (post.caption) {
        const hashtags = post.caption.match(/#[\w가-힣]+/g) || [];
        hashtags.forEach(hashtag => {
          const cleanTag = hashtag.replace('#', '');
          stats.topHashtags[cleanTag] = (stats.topHashtags[cleanTag] || 0) + 1;
        });
      }
      
      // 계정 통계 (실제 필드명: ownerUsername)
      if (post.ownerUsername) {
        stats.topAccounts[post.ownerUsername] = (stats.topAccounts[post.ownerUsername] || 0) + 1;
      }
      
      // 일별 통계 (실제 필드명: timestamp)
      const date = new Date(post.timestamp).toISOString().split('T')[0];
      if (!stats.dailyStats[date]) {
        stats.dailyStats[date] = {
          date,
          posts: 0,
          likes: 0,
          comments: 0
        };
      }
      stats.dailyStats[date].posts += 1;
      stats.dailyStats[date].likes += post.likesCount || 0;
      stats.dailyStats[date].comments += post.commentsCount || 0;
    });
    
    // 상위 해시태그/계정 정렬
    stats.topHashtags = Object.entries(stats.topHashtags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [tag, count]) => ({ ...obj, [tag]: count }), {});
    
    stats.topAccounts = Object.entries(stats.topAccounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [account, count]) => ({ ...obj, [account]: count }), {});
    
    res.json({
      success: true,
      stats,
      dateRange: parseInt(dateRange)
    });
  } catch (error) {
    console.error('인스타그램 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 인기 해시태그 조회
router.get('/trending-hashtags', async (req, res) => {
  try {
    const { limit = 20, dateRange = 7 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('caption, likesCount, commentsCount, timestamp')
      .gte('timestamp', daysAgo.toISOString());
    
    if (error) throw error;
    
    // 해시태그별 통계 계산
    const hashtagStats = {};
    
    data.forEach(post => {
      if (post.caption) {
        // caption에서 해시태그 추출
        const hashtags = post.caption.match(/#[\w가-힣]+/g) || [];
        hashtags.forEach(hashtagWithHash => {
          const hashtag = hashtagWithHash.replace('#', '');
          if (!hashtagStats[hashtag]) {
            hashtagStats[hashtag] = {
              tag: hashtag,
              count: 0,
              totalLikes: 0,
              totalComments: 0,
              avgEngagement: 0
            };
          }
          
          hashtagStats[hashtag].count += 1;
          hashtagStats[hashtag].totalLikes += post.likesCount || 0;
          hashtagStats[hashtag].totalComments += post.commentsCount || 0;
        });
      }
    });
    
    // 평균 참여율 계산 및 정렬
    const trendingHashtags = Object.values(hashtagStats)
      .map(stat => ({
        ...stat,
        avgEngagement: stat.count > 0 ? (stat.totalLikes + stat.totalComments) / stat.count : 0
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      hashtags: trendingHashtags,
      dateRange: parseInt(dateRange)
    });
  } catch (error) {
    console.error('트렌딩 해시태그 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 특정 포스트 상세 조회
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('인스타그램 포스트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;