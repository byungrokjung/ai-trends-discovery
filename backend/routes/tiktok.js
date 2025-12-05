const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// TikTok 콘텐츠 목록 조회
router.get('/contents', async (req, res) => {
  try {
    const { 
      limit = 1000, 
      offset = 0, 
      sort_by = 'likes_count', 
      order = 'desc',
      author = '',
      search = ''
    } = req.query;

    console.log('🎵 TikTok 콘텐츠 요청:', { limit, offset, sort_by, order });

    let query = supabase
      .from('tiktok_contents')
      .select(`
        id, video_id, video_url, description, created_at, created_timestamp,
        author_id, author_name, author_nickname, author_avatar, author_verified,
        author_followers, video_duration, video_cover_url, music_name,
        play_count, digg_count, share_count, collect_count, comment_count,
        hashtags, hashtag_count, engagement_rate
      `);

    // 작성자 필터
    if (author) {
      query = query.ilike('author_name', `%${author}%`);
    }

    // 검색 필터
    if (search) {
      query = query.or(
        `description.ilike.%${search}%,author_name.ilike.%${search}%`
      );
    }

    // 정렬
    const validSortFields = ['digg_count', 'comment_count', 'share_count', 'play_count', 'created_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'digg_count';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };

    query = query
      .order(sortField, sortOrder)
      .range(offset, parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ TikTok 조회 오류:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log(`✅ TikTok 데이터 조회 성공: ${data?.length || 0}개`);

    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });

  } catch (error) {
    console.error('❌ TikTok 콘텐츠 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TikTok 콘텐츠 상세 조회
router.get('/contents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tiktok_contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'TikTok 콘텐츠를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('❌ TikTok 상세 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TikTok 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('tiktok_contents')
      .select(`
        count(*),
        sum(likes_count)::int,
        sum(comments_count)::int,
        sum(shares_count)::int,
        sum(views_count)::int,
        avg(likes_count)::float,
        max(likes_count)::int,
        min(created_at),
        max(created_at)
      `)
      .single();

    if (error) {
      throw error;
    }

    // 최고 인기 콘텐츠 조회
    const { data: topContent } = await supabase
      .from('tiktok_contents')
      .select('author_name, description, digg_count, comment_count, share_count')
      .order('digg_count', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        total_contents: stats.count || 0,
        total_likes: stats.sum || 0,
        total_comments: stats.sum_1 || 0,
        total_shares: stats.sum_2 || 0,
        total_views: stats.sum_3 || 0,
        average_likes: Math.round(stats.avg || 0),
        max_likes: stats.max || 0,
        date_range: {
          from: stats.min,
          to: stats.max
        },
        top_content: topContent || []
      }
    });

  } catch (error) {
    console.error('❌ TikTok 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TikTok 트렌딩 해시태그 조회
router.get('/trending-hashtags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // 해시태그 추출 및 집계 (단순 버전)
    const { data: contents } = await supabase
      .from('tiktok_contents')
      .select('description, digg_count')
      .order('digg_count', { ascending: false })
      .limit(500);

    const hashtagCounts = {};

    contents?.forEach(content => {
      const description = content.description || '';
      const hashtags = description.match(/#[\w가-힣]+/g) || [];
      const weight = content.digg_count || 1;

      hashtags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + weight;
      });
    });

    const trendingHashtags = Object.entries(hashtagCounts)
      .filter(([tag, count]) => tag.length > 1 && count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([tag, count]) => ({ hashtag: tag, score: count }));

    res.json({
      success: true,
      data: trendingHashtags
    });

  } catch (error) {
    console.error('❌ TikTok 트렌딩 해시태그 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TikTok 작성자별 통계
router.get('/authors', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data: authors, error } = await supabase
      .from('tiktok_contents')
      .select(`
        author_name,
        count(*) as content_count,
        sum(digg_count)::int as total_likes,
        sum(comment_count)::int as total_comments,
        sum(share_count)::int as total_shares,
        avg(digg_count)::float as avg_likes,
        max(digg_count)::int as max_likes
      `)
      .not('author_name', 'is', null)
      .group('author_name')
      .order('total_likes', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: authors?.map(author => ({
        username: author.author_name,
        content_count: author.content_count || 0,
        total_likes: author.total_likes || 0,
        total_comments: author.total_comments || 0,
        total_shares: author.total_shares || 0,
        avg_likes: Math.round(author.avg_likes || 0),
        max_likes: author.max_likes || 0
      })) || []
    });

  } catch (error) {
    console.error('❌ TikTok 작성자 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;