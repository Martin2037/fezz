import { marked } from 'marked';
import { memo, useMemo } from 'react';

export default memo(function ChatThinking(props) {
  const { parts = [] } = props?.message || {};

  if (parts?.length && (!parts.find(item => item.type === 'text' || item.type === 'tool-invocation'))) {
    return (
      <p>thinking...</p>
    )
  }

  const tool = parts.find(item => item.type === 'tool-invocation');

  if (tool?.toolInvocation) {

  }

  return null;
});
