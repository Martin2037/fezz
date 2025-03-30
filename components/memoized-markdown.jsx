import { marked } from 'marked';
import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

// 添加节流功能，控制重渲染频率
function useThrottledValue(value, delay = 150) {
  // 确保输入是字符串
  const safeValue = typeof value === 'string' ? value : String(value || '');
  const [throttledValue, setThrottledValue] = useState(safeValue);
  
  useEffect(() => {
    // 如果内容很短（不到50个字符），不使用节流
    if (safeValue && safeValue.length < 50) {
      setThrottledValue(safeValue);
      return;
    }
    
    const handler = setTimeout(() => {
      setThrottledValue(safeValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [safeValue, delay]);

  return throttledValue;
}

function parseMarkdownIntoBlocks(markdown) {
  if (!markdown) return [];
  
  // 确保输入是字符串类型
  const markdownText = typeof markdown === 'string' ? markdown : String(markdown);
  
  try {
    const tokens = marked.lexer(markdownText);
    return tokens.map(token => token.raw);
  } catch (e) {
    console.error('Error parsing markdown:', e);
    return [markdownText]; // 解析失败时返回转换后的内容
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
    // 确保 content 是字符串类型
    const safeContent = content !== undefined && content !== null ? 
      (typeof content === 'string' ? content : String(content)) : '';
    
    // 使用节流值减少更新频率
    const throttledContent = useThrottledValue(safeContent);
    
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
    
    // 转换为字符串进行比较
    const prevContent = prevProps.content !== undefined && prevProps.content !== null ? 
      String(prevProps.content) : '';
    const nextContent = nextProps.content !== undefined && nextProps.content !== null ? 
      String(nextProps.content) : '';
    
    // 内容相同，无需重新渲染
    if (prevContent === nextContent) return true;
    
    // 如果内容长度变化不大（少于10个字符），跳过渲染
    if (
      prevContent && 
      nextContent && 
      Math.abs(prevContent.length - nextContent.length) < 10
    ) {
      return true;
    }
    
    return false;
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';