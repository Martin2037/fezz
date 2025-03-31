"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from 'next/link';
import { Router } from "lucide-react";

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
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import React from "react";

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
    <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm w-[120px] relative">
      {/* 左侧中间位置 */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ left: '-8px' }}
      />

      <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center">
        {data.logoPath && (
          <img src={data.logoPath} alt={data.label} className="w-full h-full object-contain" />
        )}
      </div>
      <h3 className="text-xs font-medium text-center text-gray-700">{data.label}</h3>
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
      data: { label: 'User' },
      draggable: false,
    },
    {
      id: 'fezz',
      type: 'fezzNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Fezz',
        description: 'Intelligent Agent'
      },
      draggable: false,
    },
    {
      id: 'server1',
      type: 'serverNode',
      position: { x: 700, y: 60 },
      data: { 
        label: 'Uniswap',
        logoPath: '/logo/uniswap.svg'
      },
      draggable: false,
    },
    {
      id: 'server2',
      type: 'serverNode',
      position: { x: 700, y: 160 },
      data: { 
        label: 'Aave',
        logoPath: '/logo/aave.svg'
      },
      draggable: false,
    },
    {
      id: 'server3',
      type: 'serverNode',
      position: { x: 700, y: 260 },
      data: { 
        label: 'GoPlus',
        logoPath: '/logo/goplus.svg'
      },
      draggable: false,
    },
    {
      id: 'server4',
      type: 'serverNode',
      position: { x: 700, y: 360 },
      data: { 
        label: 'More...',
        logoPath: '/logo/more.svg'
      },
      draggable: false,
      style: { opacity: 0.7 }
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
    {
      id: 'fezz-server4',
      source: 'fezz',
      sourceHandle: 'c',
      target: 'server4',
      targetHandle: 'a',
      type: 'straight',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2, opacity: 0.5, strokeDasharray: '5,5' },
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

  return (
    <div className="relative h-screen overflow-hidden bg-white dark:bg-black">
      <div
        className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* 页面顶部导航栏 */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Logo + 产品名 */}
          <div className="flex items-center gap-2">
            <img
              src="/logo/logo.jpg"
              draggable={false}
              alt="logo"
              className="w-8 h-8 inline-block text-xl"
            />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Fezz</span>
          </div>
          
          {/* 导航链接 */}
          <div className="hidden md:flex items-center">
            <Link href="/mcps">
              <div className="px-4 py-2 cursor-pointer text-gray-700 hover:text-purple-600 font-medium flex items-center gap-2 transition-colors">
                <Router size={18} />
                Servers
              </div>
            </Link>
          </div>
          
          {/* 钱包地址按钮 */}
          {ready && walletReady ?
            <div className="cursor-pointer">
              {wallets.length === 0 ?
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-6 py-2 hover:opacity-90 transition-all border-none shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="currentColor"/>
                    </svg>
                    连接钱包
                  </span>
                </Button>
                :
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-gray-700 font-medium rounded-full px-4 py-2 hover:shadow-md transition-all flex items-center gap-2">
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16Z" fill="white"/>
                        </svg>
                      </div>
                      {formatAddress(wallets[0].address)}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[220px] bg-white border border-purple-100 shadow-lg rounded-xl p-1">
                    <DropdownMenuItem className="rounded-lg hover:bg-purple-50 cursor-pointer py-2 px-3 flex items-center gap-2 text-gray-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 8L15.59 9.41L17.17 11H9V13H17.17L15.59 14.58L17 16L21 12L17 8ZM5 5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H12V19H5V5Z" fill="#8B5CF6"/>
                      </svg>
                      <div onClick={logout}>
                        Logout
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            </div> :
            <div className="cursor-pointer">
              <div className="flex items-center gap-2 text-gray-400 rounded-full px-4 py-2 bg-gray-50 animate-pulse">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                </svg>
                Loading...
              </div>
            </div>
          }
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 w-full max-w-5xl my-auto"
        >
          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            className="relative text-center text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            layout
          >
            The <ContainerTextFlip words={["real", "best", "secure", "smart"]} /> gateway to Web3
          </motion.div>
          
          {/* CTA 按钮 */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <button className="group flex items-center justify-center py-4 px-8 bg-[#006aff] border-8 border-[#c0dfff] text-white gap-2 rounded-[50px] cursor-pointer transition-all duration-300 hover:border-[#b1d8ff] hover:bg-[#1b7aff] active:border-[5px]">
                <span className="text-[1.7em] font-bold tracking-wider">Let&apos;s Chat!</span>
                <span className="pt-[5px] h-full w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="30"
                    viewBox="0 0 38 15"
                    fill="none"
                    className="group-hover:animate-[jello-vertical_0.9s_both] origin-left"
                  >
                    <path
                      fill="white"
                      d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                    ></path>
                  </svg>
                </span>
              </button>
            </Link>
          </div>

          <div className="mt-4 w-full" style={{ height: '450px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={1}
              maxZoom={1}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
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
        </motion.div>
      </main>
    </div>
  );
}
