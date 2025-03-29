"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {useRouter} from "next/navigation";
import {usePrivy, useWallets} from "@privy-io/react-auth";
import {formatAddress} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// 重新设计节点样式，确保连接点位置一致
const UserNode = ({ data }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm w-[120px] relative">
      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
        <span className="text-xl">👤</span>
      </div>
      <h3 className="text-lg font-medium text-center text-gray-700">{data.label}</h3>
      {/* 放在最右侧中间位置 */}
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ right: '-8px' }}
      />
    </div>
  );
};

const FezzNode = ({ data }) => {
  return (
    <div className="bg-purple-50 rounded-lg p-5 border border-purple-200 shadow-sm w-[180px] relative">
      {/* 左侧中间位置 */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ left: '-8px' }}
      />

      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
        <span className="text-2xl">🤖</span>
      </div>
      <h3 className="text-xl font-medium text-center mb-1 text-gray-700">{data.label}</h3>
      <p className="text-sm text-center text-gray-500">{data.description}</p>

      {/* 右侧三个连接点，调整为绝对定位 */}
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ right: '-8px', top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ right: '-8px', top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{ right: '-8px', top: '75%' }}
      />
    </div>
  );
};

const ServerNode = ({ data }) => {
  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm w-[140px] relative">
      {/* 左侧中间位置 */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ left: '-8px' }}
      />

      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
        <span className="text-sm">⚡</span>
      </div>
      <h3 className="text-sm font-medium text-center text-gray-700">{data.label}</h3>
    </div>
  );
};

export default function Home() {
  // 水平对称布局 - 固定位置
  const nodes = [
    {
      id: 'user',
      type: 'userNode',
      position: { x: 100, y: 175 },
      data: { label: '用户' },
      draggable: false,
    },
    {
      id: 'fezz',
      type: 'fezzNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Fezz',
        description: '智能调度中心'
      },
      draggable: false,
    },
    {
      id: 'server1',
      type: 'serverNode',
      position: { x: 700, y: 60 },
      data: { label: 'MCP 服务 1' },
      draggable: false,
    },
    {
      id: 'server2',
      type: 'serverNode',
      position: { x: 700, y: 185 },
      data: { label: 'MCP 服务 2' },
      draggable: false,
    },
    {
      id: 'server3',
      type: 'serverNode',
      position: { x: 700, y: 310 },
      data: { label: 'MCP 服务 3' },
      draggable: false,
    },
  ];

  // 使用特定的边类型和明确的连接点
  const edges = [
    {
      id: 'user-fezz',
      source: 'user',
      sourceHandle: 'a',
      target: 'fezz',
      targetHandle: 'a',
      type: 'straight',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    },
    {
      id: 'fezz-server1',
      source: 'fezz',
      sourceHandle: 'a',
      target: 'server1',
      targetHandle: 'a',
      type: 'straight',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    },
    {
      id: 'fezz-server2',
      source: 'fezz',
      sourceHandle: 'b',
      target: 'server2',
      targetHandle: 'a',
      type: 'straight',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    },
    {
      id: 'fezz-server3',
      source: 'fezz',
      sourceHandle: 'c',
      target: 'server3',
      targetHandle: 'a',
      type: 'straight',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    },
  ];

  // 节点类型映射
  const nodeTypes = {
    userNode: UserNode,
    fezzNode: FezzNode,
    serverNode: ServerNode,
  };

  // 完全禁用交互的选项
  const proOptions = {
    hideAttribution: true
  };

  const router = useRouter()
  const {ready, user, logout} = usePrivy()
  const {wallets, ready: walletReady} = useWallets()
  console.log('wallets', wallets)
  console.log('user', user)
  console.log('ready', ready)

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      </div>

      {/* 主要内容 */}
      <main className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 w-full max-w-5xl"
        >
          {/* 标题部分 */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Web3 智能对话平台
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            探索下一代去中心化 AI 对话体验，连接 Web3 世界，实现智能交互的无限可能
          </p>

          {/* CTA 按钮 */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              开始对话
            </Button>
            <Button size="lg" variant="outline">
              了解更多
            </Button>
          </div>

          {/* React Flow 流程图 - 完全静态 */}
          <div className="mt-16 w-full" style={{ height: '450px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={1}
              maxZoom={1}
              defaultZoom={1}
              zoomOnPinch={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              panOnScroll={false}
              panOnDrag={false}
              nodesDraggable={false}
              elementsSelectable={false}
              nodesConnectable={false}
              preventScrolling={true}
              proOptions={proOptions}
            >
              <Background color="#888" gap={15} size={1} style={{ opacity: 0.04 }} />
            </ReactFlow>
          </div>

          {ready && walletReady ?
              <div className={'cursor-pointer absolute right-4 top-4'}>
                {wallets.length === 0 ?
                    <Button onClick={() => router.push('/login')}>
                      去登录
                    </Button>
                    :
                    <DropdownMenu>
                      <DropdownMenuTrigger>{formatAddress(wallets[0].address)}</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <div onClick={logout}>退出登录</div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                }
              </div> :
              <div className={'cursor-pointer absolute right-4 top-4'}>
                loading...
              </div>
          }
        </motion.div>
      </main>
    </div>
  );
}
