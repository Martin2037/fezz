'use client';

import Link from 'next/link';
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect, useRef } from 'react';
import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
  LoadingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import { mcpServers } from '../const/mcps';

const renderTitle = (icon, title) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);
const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?',
  },
];
const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      height: 100vh;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});
const placeholderPromptsItems = [
  {
    key: '1',
    label: renderTitle(
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />,
      'Hot Topics',
    ),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(
      <ReadOutlined
        style={{
          color: '#1890FF',
        }}
      />,
      'Design Guide',
    ),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];
const senderPromptsItems = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: (
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />
    ),
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: (
      <ReadOutlined
        style={{
          color: '#1890FF',
        }}
      />
    ),
  },
];
const roles = {
  ai: {
    placement: 'start',
    typing: {
      step: 5,
      interval: 20,
    },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};

import { useChat } from '@ai-sdk/react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';

const ChatPage = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  // const [content, setContent] = React.useState('');
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState([]);
  const senderRef = useRef(null);

  // new ai
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    id: activeKey,
    body: {
      mcp_list: mcpServers.map(item => {
        return {
          name: item.name,
          url: window.location.origin + item.localUrl, // 'http://localhost:3071/api/mcp/sse/goplus'
        }
      })
    },
    experimental_throttle: 200,
    onFinish: (message) => {
      console.log(message);
    }
  });

  // ==================== Event ====================
  const handleSenderChange = (v) => {
    handleInputChange({
      target: {
        value: v
      }
    });
  }
  const onSubmit = (nextContent) => {
    if (!nextContent) return;
    // onRequest(nextContent);
    // setContent('');
    handleSubmit({
      target: {
        value: nextContent,
      },
    });

    handleInputChange({
      target: {
        value: ''
      }
    });
  };
  const onPromptsItemClick = (info) => {
    // onRequest(info.data.description);
    const promptText = info?.data?.description || '';
    if (!promptText) return;

    handleSubmit({
      target: {
        value: promptText,
      },
    });
    // 不再需要在此处调用 handleInputChange，因为 handleSubmit 会处理状态更新
  };
  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };
  const onConversationClick = (key) => {
    setActiveKey(key);
  };
  const handleFileChange = (info) => setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Web3 智能对话平台"
        description="Base on XXX, AGI product interface solution, create a better intelligent vision~"
        /*extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }*/
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );
  const items = messages.map(({ id, content, status, role, parts }) => {
    const tools = parts?.filter(item => item?.toolInvocation?.toolName);

    return {
      key: id,
      loading: !content && isLoading,
      role: role === 'user' ? 'local' : 'ai',
      content: (
        <>
          {
            tools?.length > 0 && (
              <ul class="space-y-4 w-64 p-2 bg-white rounded-lg shadow">
                {
                  tools.map((item, index) => {
                    return (
                      <li class="flex justify-between items-center">
                        <span class="text-gray-700 font-medium">调用MCP:&nbsp;&nbsp;{item.toolInvocation?.toolName}</span>
                        <div class="flex items-center">
                          {
                            item.toolInvocation?.result ? <CheckOutlined style={{ color: 'green' }} /> : <LoadingOutlined />
                          }
                        </div>
                      </li>
                    )
                  })
                }
              </ul>
            )
          }
          <MemoizedMarkdown id={id} content={content || ''} />
        </>
      ),
    }
  });


  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
    </Badge>
  );
  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? {
              title: 'Drop file here',
            }
            : {
              icon: <CloudUploadOutlined />,
              title: 'Upload files',
              description: 'Click or drag files to this area to upload',
            }
        }
      />
    </Sender.Header>
  );
  const logoNode = (
    <div className={styles.logo}>
      <Link href="/">
        <img
          src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
          draggable={false}
          alt="logo"
        />
        <span>Logo</span>
      </Link>
    </div>
  );

  // ==================== Render =================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={
            items.length > 0
              ? items
              : [
                {
                  content: placeholderNode,
                  variant: 'borderless',
                },
              ]
          }
          roles={roles}
          className={styles.messages}
        />

        {/* 🌟 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />
        {/* 🌟 输入框 */}
        <Sender
          ref={senderRef}
          value={input}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={handleSenderChange}
          prefix={attachmentsNode}
          loading={false/*agent.isRequesting()*/}
          className={styles.sender}
        />
      </div>
    </div>
  );
};
export default ChatPage;
