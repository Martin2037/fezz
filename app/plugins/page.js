'use client';


import { useState } from 'react';

export default function Plugins() {

  const [plugins, setPlugins] = useState([
    {
      id: '11',
      name: '插件1',
      version: '1.0.0',
      active: true,
    },
    {
      id: '22',
      name: '插件2',
      version: '2.0.0',
      active: true,
    }
  ]);

  const [modalObj, setModalObj] = useState();

  const handleAdd = () => {
    setModalObj({
      title: '新增',
      content: (
        <>
          <input
            type="text"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white placeholder-gray-400"
            placeholder="插件名称"
            required
          />
          <input
            type="text"
            class="mt-3 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white placeholder-gray-400"
            placeholder="版本"
            required
          />
        </>
      ),
    });
  };

  const handleEdit = (plugin) => {
    // setFormData(plugin);
    setModalObj({
      title: '编辑',
      content: (
        <>
          <input
            value={plugin.name}
            type="text"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white placeholder-gray-400"
            placeholder="插件名称"
            required
          />
          <input
            value={plugin.version}
            type="text"
            class="mt-3 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white placeholder-gray-400"
            placeholder="版本"
            required
          />
        </>
      ),
    });
  };

  const setDeleteTarget = (plugin) => {
    setModalObj({
      title: '删除' + plugin.name,
      content: '确认删除嘛',
    });
  };

  const closeModal = () => {
    setModalObj(undefined);
  };

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <header className="text-center">
        <h4
          className="mt-6 mb-6 text-2xl font-bold tracking-tight sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          插件管理
        </h4>
      </header>
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
            >
              新增插件
            </button>
          </div>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">插件名称</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {plugins.map(plugin => (
          <tr key={plugin.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {plugin.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              v{plugin.version}
            </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              plugin.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {plugin.active ? '已启用' : '已禁用'}
            </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
              <button
                onClick={() => handleEdit(plugin)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                编辑
              </button>
              <button
                onClick={() => setDeleteTarget(plugin.id)}
                className="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {
        modalObj && (
          <div id="modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">{modalObj?.title}</h3>
                <button onClick={closeModal} class="text-gray-500 hover:text-gray-700">×</button>
              </div>
              <p class="text-gray-600">{modalObj?.content}</p>
              <button onClick={closeModal} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                确认
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}
