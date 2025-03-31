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
import React, { useEffect, useRef, useState } from 'react';
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
  MenuOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, message, Popover, List, Checkbox } from 'antd';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import {ethers} from 'ethers';
import ky from 'ky'; // 引入ky请求库
import { mcpServers } from '../const/mcps';
import { Player } from '@lottiefiles/react-lottie-player';

const renderTitle = (icon, title) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);
const defaultConversationsItems = [
  {
    key: '0',
    label: 'Welcome',
  },
];
const placeholderPromptsItems = [
  {
    key: '1',
    label: renderTitle(
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />,
      'Informations',
    ),
    description: 'On-Chain News',
    children: [
      {
        key: '1-1',
        description: `Trending tokens on BSC`,
      },
      {
        key: '1-2',
        description: `Check scams of addresses`,
      },
      {
        key: '1-3',
        description: `Detect scams of websites`,
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
      'Actions',
    ),
    description: 'Do whatever you want with your wallet',
    children: [
      {
        key: '2-1',
        description: `Swap tokens`,
      },
    ],
  },
];
const senderPromptsItems = [
  {
    key: '1',
    description: 'Informations',
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

// 用于处理swap交易的组件
const SwapConfirmation = ({ onConfirm, toolContent }) => {
  // 将对象格式的toolContent转换为可读的格式
  const renderToolContent = () => {
    if (!toolContent) return null;

    try {
      // 如果是字符串格式的JSON，尝试解析
      const contentObj = typeof toolContent === 'string'
        ? JSON.parse(toolContent)
        : toolContent;

      // 将对象转换为格式化的内容
      return (
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-2">交易详情：</div>
          <ul className="list-disc pl-5">
            {contentObj.srcToken && (
              <li>源代币: {contentObj.srcToken.substring(0, 10)}...{contentObj.srcToken.substring(contentObj.srcToken.length - 6)}</li>
            )}
            {contentObj.destToken && (
              <li>目标代币: {contentObj.destToken.substring(0, 10)}...{contentObj.destToken.substring(contentObj.destToken.length - 6)}</li>
            )}
            {contentObj.srcAmount && <li>源数量: {contentObj.srcAmount}</li>}
            {contentObj.destAmount && <li>目标数量: {contentObj.destAmount}</li>}
            {contentObj.srcUSD && <li>源金额(USD): ${contentObj.srcUSD}</li>}
            {contentObj.destUSD && <li>目标金额(USD): ${contentObj.destUSD}</li>}
            {contentObj.gasCostUSD && <li>Gas费用(USD): ${contentObj.gasCostUSD}</li>}
          </ul>
        </div>
      );
    } catch (error) {
      // 如果解析失败，直接显示字符串
      return <p className="text-sm text-gray-700">{String(toolContent)}</p>;
    }
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">交易确认</h3>
      {toolContent && (
        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
          {renderToolContent()}
        </div>
      )}
      <ol className="list-decimal pl-5 mb-4">
        <li className="mb-1">第一步：授权代币</li>
        <li>第二步：执行 Swap 交易</li>
      </ol>
      <div className="flex justify-center">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          确认交易
        </button>
      </div>
    </div>
  );
};

const ChatPage = () => {

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState([]);
  const senderRef = useRef(null);
  const { wallets, ready } = useWallets();
  const [userWallet, setUserWallet] = useState("");
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  // 用于保存已标记为含有swap工具的消息ID
  const [swapMessageIds, setSwapMessageIds] = useState(new Set());
  // 存储激活状态的swapTool中的toolInvocation.result.content.text对象
  const [swapToolContent, setSwapToolContent] = useState(null);
  const [mcpListOpen, setMcpListOpen] = useState(false);
  const [mcpList, setMcpList] = useState(mcpServers.map(item => ({ ...item, checked: true })));

  // 处理swap确认
  const handleSwapConfirm = async (swapTool) => {
    console.log('交易已确认，swapTool:', swapTool);

    if (isProcessingTx) {
      message.warning('正在处理交易，请稍候...');
      return;
    }

    if (!userWallet) {
      message.error('请先连接钱包');
      return;
    }

    try {
      setIsProcessingTx(true);
      message.loading('正在处理交易请求...');

      // 获取交易内容
      const content = swapTool?.result?.content?.[0]?.text || swapToolContent;
      let swapData = JSON.parse(content);

      try {
        await userWallet.switchChain(56)
        const privyProvider = await userWallet.getEthereumProvider();
        const provider = new ethers.providers.Web3Provider(privyProvider);
        const signer = provider.getSigner();


        // 从RPC获取当前的gas参数
        console.log('正在从RPC获取gas参数...');
        const feeData = await provider.getFeeData();
        console.log('获取到的gas参数:', feeData);

        // 创建新的交易对象，使用RPC获取的gas参数
        const txData = {
          from: userWallet.address,
          to: swapData.to,
          data: swapData.data,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          value: parseInt(swapData.value),
          chainId: parseInt(swapData.chainId) || 56
        };

        // 使用新对象替换原对象
        swapData = txData;

        console.log('获取到的交易内容:', swapData);

        if (!swapData) {
          throw new Error('未找到交易信息');
        }

        // 发送交易
        const txResponse = await signer.sendTransaction(txData);
        console.log('交易已发送，等待确认:', txResponse.hash);

        // 等待交易被挖出
        message.loading('交易已发送，等待确认...');
        const receipt = await txResponse.wait();
        console.log('交易已确认:', receipt);

        // 交易成功
        message.success('交易已成功确认！交易哈希: ' + txResponse.hash);
      } catch (walletError) {
        console.error('钱包交易失败:', walletError);
        message.error('钱包交易失败: ' + (walletError?.message || '未知错误'));
      }
    } catch (error) {
      console.error('处理交易出错:', error);
      message.error('处理交易时出错: ' + error.message);
    } finally {
      setIsProcessingTx(false);
    }
  };

  // new ai
  const { messages, input, setInput, handleInputChange, handleSubmit, append, isLoading, setMessages } = useChat({
    id: activeKey,
    body: {
      mcp_list: mcpList.map(item => {
        return {
          name: item.name,
          url: typeof window !== 'undefined'
            ? window.location.origin + item.localUrl
            : item.localUrl
        };
      }),
      userWalletAddress: userWallet?.address || ''
    },
    experimental_throttle: 200,
    onToolCall: (toolCall) => {
      console.log(toolCall);
    },
    onFinish: (message) => {
      console.log('完成消息:', message);

      // 检查message.parts数组中的工具调用
      if (message.parts && Array.isArray(message.parts)) {
        console.log('检查parts数组:', message.parts);

        // 查找parts数组中type为tool-invocation且toolName包含swap的项
        const swapToolPart = message.parts.find(
          part => part.type === 'tool-invocation' &&
                 part.toolInvocation?.toolName?.toLowerCase().includes('swap')
        );

        if (swapToolPart) {
          console.log('找到swap工具调用:', swapToolPart);

          // 保存消息ID到Set中
          setSwapMessageIds(prev => new Set([...prev, message.id]));

          // 存储toolInvocation.result.content.text对象
          if (swapToolPart.toolInvocation?.result?.content?.[0]?.text) {
            try {
              // 尝试解析工具返回的内容，如果是JSON字符串
              const content = swapToolPart.toolInvocation.result.content[0].text;
              // 无论是否为JSON字符串，都保存为字符串格式，保持一致性
              setSwapToolContent(typeof content === 'string' ? content : JSON.stringify(content));
              console.log('存储了swap工具内容:', typeof content === 'string' ? content : JSON.stringify(content));
            } catch (error) {
              console.error('解析swap工具内容失败:', error);
              // 发生错误时，保存原始内容
              setSwapToolContent(String(swapToolPart.toolInvocation.result.content[0].text));
            }
          }

          // 更新messages数组中的对应消息
          setMessages(prev => {
            const updated = [...prev];
            const messageIndex = updated.findIndex(msg => msg.id === message.id);

            console.log('找到消息索引:', messageIndex);

            if (messageIndex !== -1) {
              // 为消息添加一个自定义属性，表示它包含swap工具调用
              updated[messageIndex] = {
                ...updated[messageIndex],
                hasSwapTool: swapToolPart.toolInvocation
              };

              console.log('更新后的消息:', updated[messageIndex]);
            }

            return updated;
          });

          return; // 找到swap工具后不再继续检查
        }
      }

      // 如果没有直接找到，尝试检查消息内容是否包含swap关键词
      if (message.content && message.content.toLowerCase().includes('swap')) {
        console.log('在消息内容中检测到swap关键词');

        // 保存消息ID到Set中
        setSwapMessageIds(prev => new Set([...prev, message.id]));

        setMessages(prev => {
          const updated = [...prev];
          const messageIndex = updated.findIndex(msg => msg.id === message.id);

          if (messageIndex !== -1) {
            updated[messageIndex] = {
              ...updated[messageIndex],
              hasSwapTool: { toolName: 'content-detected-swap' }
            };
          }

          return updated;
        });
      }
    }
  });

  // 当消息更新时，确保标记的swap消息不会丢失hasSwapTool属性
  useEffect(() => {
    if (swapMessageIds.size > 0) {
      let needsUpdate = false;
      const updatedMessages = messages.map(msg => {
        // 如果消息ID在swapMessageIds中，但没有hasSwapTool属性
        if (swapMessageIds.has(msg.id) && !msg.hasSwapTool) {
          console.log(`恢复消息 ${msg.id} 的swap标记`);
          needsUpdate = true;

          // 如果存在存储的swapToolContent，使用它
          const toolInvocation = swapToolContent ?
            {
              toolName: 'restored-swap-tool',
              result: {
                content: [{ text: swapToolContent }]
              }
            } :
            { toolName: 'restored-swap-tool' };

          return {
            ...msg,
            hasSwapTool: toolInvocation
          };
        }
        return msg;
      });

      // 只有在需要更新时才调用setMessages
      if (needsUpdate) {
        console.log('恢复标记后的消息:', updatedMessages);
        setMessages(updatedMessages);
      }
    }
  }, [messages, swapMessageIds, setMessages, swapToolContent]);


  useEffect(() => {
    if (ready) {
      setUserWallet(wallets[0]);
      console.log('钱包地址:', wallets[0]);
    }
  }, [ready, wallets]);

  // ==================== Event ====================
  const handleSenderChange = (v) => {
    setInput(v);
  }
  const onSubmit = (nextContent) => {
    if (!nextContent) return;
    // onRequest(nextContent);
    // setContent('');
    append({
      role: "user",
      content: nextContent
    });

    setInput('')
  };
  const onPromptsItemClick = (info) => {
    const promptText = info?.data?.description || '';
    if (!promptText) return;
    append({
      role: 'user',
      content: promptText,
    });
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
    <Space direction="vertical" size={16} className="pt-8">
      <Welcome
        variant="borderless"
        icon={
          <Player
            src="/lotties/bot.json"
            className="player"
            loop
            autoplay
            style={{ height: '80px', width: '80px', paddingBottom: '20px' }}
          />
        }
        title="Hello, I'm Fezz"
        description="Base on LLMs, provide a better experience for Web3 & Crypto"
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
  const items = messages.map((msg) => {
    const { id, content, status, role, parts, hasSwapTool } = msg;
    console.log(`渲染消息 ${id}:`, { hasSwapTool: !!hasSwapTool });

    let _content = content || parts?.find(item => item.toolInvocation)?.toolInvocation?.result?.content?.[0]?.text;

    // 获取swap工具的内容，确保是字符串格式
    let swapContent = null;

    // 尝试从消息的hasSwapTool属性中获取
    if (hasSwapTool?.result?.content?.[0]?.text) {
      const rawContent = hasSwapTool.result.content[0].text;
      swapContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    }
    // 如果没有，则使用全局存储的swapToolContent
    else if (swapToolContent) {
      swapContent = swapToolContent;
    }

    console.log(`消息 ${id} 的swap内容:`, swapContent ? '有' : '无');

    // 获取工具列表
    const tools = parts?.filter(item => item?.toolInvocation?.toolName);

    return {
      key: id,
      loading: !content && isLoading,
      role: role === 'user' ? 'local' : 'ai',
      content: (
        <>
          {tools?.length > 0 && (
            <ul className="space-y-4 w-64 p-2 bg-white rounded-lg shadow">
              {tools.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">调用MCP:&nbsp;&nbsp;{item.toolInvocation?.toolName}</span>
                  <div className="flex items-center">
                    {item.toolInvocation?.result ? <CheckOutlined style={{ color: 'green' }} /> : <LoadingOutlined />}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <MemoizedMarkdown id={id} content={_content || ''} />
          {hasSwapTool && (
            <div className="swap-confirmation-container">
              <SwapConfirmation
                onConfirm={() => handleSwapConfirm(hasSwapTool)}
                toolContent={swapContent}
              />
            </div>
          )}
        </>
      ),
    };
  });

  const handleOpenChange = (newOpen) => {
    setMcpListOpen(newOpen);
  };

  const handleChangeMcp = (item) => {
    item.checked = !item.checked;
    setMcpList([...mcpList]);
  };

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
      <Popover
        content={
          <List
            size="small"
            header={<div>可选择的MCP服务</div>}
            // footer={<div>Footer</div>}
            bordered
            dataSource={mcpList}
            renderItem={
              (item) => <List.Item><Checkbox onChange={() => { handleChangeMcp(item) }} checked={item.checked}>{item.name}</Checkbox></List.Item>
            }
          />
        }
        // title="Title"
        trigger="click"
        open={mcpListOpen}
        onOpenChange={handleOpenChange}
      >
        <Button type="text" icon={<MenuOutlined />} onClick={() => setMcpListOpen(!mcpListOpen)}  />
      </Popover>
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
    <div className="flex h-[72px] items-center justify-start px-6 box-border">
      <Link href="/">
        <img
          src="/logo/logo.jpg"
          draggable={false}
          alt="logo"
          className="w-6 h-6 inline-block"
        />
        <span className="inline-block mx-2 font-bold text-gray-900 text-base">Fezz</span>
      </Link>
    </div>
  );

  // ==================== Render =================
  return (
    <div className="w-full h-screen flex bg-white font-sans">
      <div className="bg-gray-100/80 w-[280px] h-full flex flex-col">
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className="bg-blue-50 border border-blue-200/80 w-[calc(100%-24px)] mx-3 mb-6"
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className="px-3 flex-1 overflow-y-auto"
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className="h-full w-full m-auto box-border flex flex-col p-6 gap-4">
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
          className="flex-1"
        />
        {/* 🌟 输入框 */}
        <Sender
          ref={senderRef}
          value={input}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={handleSenderChange}
          prefix={attachmentsNode}
          loading={false}
          className="shadow-md"
        />
      </div>
    </div>
  );
};
export default ChatPage;
