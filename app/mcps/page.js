'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'motion/react';

// MCP服务器数据
const mcpServers = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Decentralized trading protocol that uses automated market-making (AMM) model to facilitate cryptocurrency token trading through MCP server.',
    provider: 'uniswap',
    providerName: 'Uniswap Labs',
    tags: ['defi', 'exchange', 'swap'],
    url: 'mcp://uniswap.mcp.dev',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/uniswap.svg'
  },
  {
    id: 'goplus',
    name: 'GoPlus',
    description: 'Blockchain security solution provider offering real-time security detection and risk alerts for MCP services with comprehensive protection layers.',
    provider: 'goplus',
    providerName: 'GoPlus Security',
    tags: ['security', 'blockchain', 'risk-detection'],
    url: 'mcp://goplus.mcp.dev',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/goplus.svg'
  },
  {
    id: 'moralis',
    name: 'Moralis',
    description: 'MCP server providing blockchain data indexing and API access, simplifying Web3 development workflows with comprehensive tooling and infrastructure.',
    provider: 'moralis',
    providerName: 'Moralis',
    tags: ['web3', 'api', 'blockchain-data'],
    url: 'mcp://moralis.mcp.dev',
    isFeatured: true,
    isEnabled: false,
    logo: '/logo/moralis.svg'
  },
  {
    id: 'bytehunter',
    name: 'ByteHunter',
    description: 'Smart contract audit and vulnerability scanning service MCP interface, providing automated security analysis for blockchain developers and projects.',
    provider: 'bytehunter',
    providerName: 'ByteHunter Security',
    tags: ['smart-contract', 'audit', 'security'],
    url: 'mcp://bytehunter.mcp.dev',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/bytehunter.png'
  },
];

// MCP卡片组件
const McpCard = ({ server, onToggle }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (codeRef.current) {
      navigator.clipboard.writeText(server.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <Link href={`/mcps/${server.id}`} className="block">
        <Card className="group p-4 h-[320px] transition-all duration-300 hover:shadow-lg hover:border-indigo-300 cursor-pointer overflow-hidden flex flex-col">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-md flex items-center justify-center overflow-hidden">
              <Image 
                src={server.logo} 
                alt={`${server.name} logo`} 
                width={48} 
                height={48} 
                className="object-contain" 
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{server.name}</h3>
                {server.isFeatured && <span className="text-amber-500">★</span>}
              </div>
              <p className="text-sm text-gray-500">by {server.providerName}</p>
            </div>
          </div>
          
          {/* Description section with line clamp */}
          <div className="mb-3">
            <p className="text-sm text-gray-700 line-clamp-3">{server.description}</p>
          </div>
          
          {/* 可复制的URL代码块 */}
          <div 
            className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-2 mb-2 text-sm font-mono cursor-pointer group/code"
            onClick={handleCopy}
          >
            <div className="flex items-center justify-between">
              <code ref={codeRef} className="text-indigo-600 dark:text-indigo-400 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{server.url}</code>
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover/code:text-indigo-500 transition-colors">
                {copied ? "Copied!" : "Copy"}
              </span>
            </div>
          </div>
          
          <div className="mt-auto pt-2 flex justify-end">
            <div className="h-6"></div>
          </div>
        </Card>
      </Link>

      <div 
        className="absolute bottom-4 right-4 flex items-center z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">
          {server.isEnabled ? "Enabled" : "Disabled"}
        </span>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(server.id);
          }}
        >
          <Switch 
            checked={server.isEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default function McpServersPage() {
  const [servers, setServers] = useState(mcpServers);
  const featuredServers = servers.filter(server => server.isFeatured);
  
  const handleToggle = (id) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === id ? {...server, isEnabled: !server.isEnabled} : server
      )
    );
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8">
        {/* 标题部分 */}
        <div className="text-center">
          <div className="inline-flex items-center bg-indigo-50 dark:bg-indigo-950 rounded-full px-3 py-1 mb-4">
            <span className="bg-indigo-500 text-white text-sm px-2 py-0.5 rounded-md mr-2">4</span>
            <span className="text-gray-800 dark:text-gray-200">MCP Servers</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-4"
          >
            <span className="text-gray-900 dark:text-gray-100">Find Awesome </span>
            <span className="text-indigo-500">Web3 MCP Servers</span>
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            The largest collection of Web3 MCP Servers.
          </p>
        </div>

        {/* 精选服务器 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Featured MCP Servers</h2>
            <Link href="/mcps/categories" className="text-indigo-500 flex items-center">
              View Categories <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredServers.map((server) => (
              <McpCard key={server.id} server={server} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
