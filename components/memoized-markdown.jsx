import { marked } from 'marked';
import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

// 添加节流功能，控制重渲染频率
function useThrottledValue(value, delay = 150) {
  const [throttledValue, setThrottledValue] = useState(value);
  
  useEffect(() => {
    // 如果内容很短（不到50个字符），不使用节流
    if (value && value.length < 50) {
      setThrottledValue(value);
      return;
    }
    
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

function parseMarkdownIntoBlocks(markdown) {
  if (!markdown) return [];
  try {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
  } catch (e) {
    console.error('Error parsing markdown:', e);
    return [markdown]; // 解析失败时返回原始内容
  }
}

const MemoizedMarkdownBlock = memo(
  ({ content }) => {
    return <Markdown>{content}</Markdown>;
  },
  (prevProps, nextProps) => {
    // 完全相同的内容不重新渲染
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }) => {
    // 使用节流值减少更新频率
    const throttledContent = useThrottledValue(content);
    
    // 缓存解析结果
    const blocks = useMemo(
      () => parseMarkdownIntoBlocks(throttledContent), 
      [throttledContent]
    );

    // 渲染前判断是否有内容变化
    if (!blocks.length) return null;

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock 
        content={block} 
        key={`${id}-block_${index}`} 
      />
    ));
  },
  // 自定义比较函数，只有当内容有实质性变化时才重新渲染
  (prevProps, nextProps) => {
    // 如果ID不同，则始终重新渲染
    if (prevProps.id !== nextProps.id) return false;
    
    // 内容相同，无需重新渲染
    if (prevProps.content === nextProps.content) return true;
    
    // 如果内容长度变化不大（少于10个字符），跳过渲染
    if (
      prevProps.content && 
      nextProps.content && 
      Math.abs(prevProps.content.length - nextProps.content.length) < 10
    ) {
      return true;
    }
    
    return false;
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';