import React, { useRef, useState, useCallback } from 'react';

import { IconButton, Input, InputNumber, Select, JsonViewer, Tooltip } from '@douyinfe/semi-ui';
import { IconBrackets } from '@douyinfe/semi-icons';

import { getValueType } from './utils';
import { JSONHeader, JSONHeaderLeft, JSONHeaderRight, JSONViewerWrapper } from './styles';

/**
 * 根据不同的数据类型渲染对应的默认值输入组件。
 * @param props - 组件属性，包括 value, type, placeholder, onChange。
 * @returns 返回对应类型的输入组件或 null。
 */
export function DefaultValue(props: {
  value: any;
  name?: string;
  type?: string;
  placeholder?: string;
  jsonFormatText?: string;
  onChange: (value: any) => void;
}) {
  const { value, type, onChange, placeholder, jsonFormatText } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const JsonViewerRef = useRef<JsonViewer>(null);

  // 为 JsonViewer 添加状态管理
  const [internalJsonValue, setInternalJsonValue] = useState<string>(
    getValueType(value) === 'string' ? value : ''
  );

  // 使用 useCallback 创建稳定的回调函数
  const handleJsonChange = useCallback((val: string) => {
    // 只在值真正改变时才更新状态
    if (val !== internalJsonValue) {
      setInternalJsonValue(val);
    }
  }, []);

  // 处理编辑完成事件
  const handleEditComplete = useCallback(() => {
    // 只有当存在key，编辑完成时才触发父组件的 onChange
    onChange(internalJsonValue);
    // 确保在更新后移除焦点
    requestAnimationFrame(() => {
      // JsonViewerRef.current?.format();
      wrapperRef.current?.blur();
    });
    setJsonReadOnly(true);
  }, [internalJsonValue, onChange]);

  const [jsonReadOnly, setJsonReadOnly] = useState<boolean>(true);

  const handleFormatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(internalJsonValue);
      const formatted = JSON.stringify(parsed, null, 4);
      setInternalJsonValue(formatted);
      onChange(formatted);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }, [internalJsonValue, onChange]);

  return type === 'string' ? (
    <Input
      size="small"
      value={value}
      onChange={(val: string) => {
        onChange(val);
      }}
      placeholder={placeholder ?? 'Default value if parameter is not provided'}
    />
  ) : type === 'integer' || type === 'number' ? (
    <InputNumber
      value={value}
      precision={type === 'integer' ? 0 : undefined}
      size="small"
      placeholder={placeholder ?? 'Default value if parameter is not provided'}
      style={{ width: '100%' }}
      onChange={(val: string | number) => {
        onChange(val);
      }}
    />
  ) : type === 'boolean' ? (
    <Select
      size="small"
      value={isNaN(Number(value)) ? 0 : Number(value)}
      style={{ width: '100%' }}
      onChange={(val: any) => onChange(Boolean(val))}
    >
      <Select.Option value={1}>true</Select.Option>
      <Select.Option value={0}>false</Select.Option>
    </Select>
  ) : type === 'object' ? (
    <>
      <JSONHeader>
        <JSONHeaderLeft>json</JSONHeaderLeft>
        <JSONHeaderRight>
          <Tooltip content={jsonFormatText ?? 'Format'}>
            <IconButton
              icon={<IconBrackets style={{ color: 'var(--semi-color-primary)' }} />}
              size="small"
              type="tertiary"
              theme="borderless"
              onClick={handleFormatJson}
            />
          </Tooltip>
        </JSONHeaderRight>
      </JSONHeader>

      <JSONViewerWrapper
        ref={wrapperRef}
        tabIndex={-1}
        onBlur={(e) => {
          if (wrapperRef.current && !wrapperRef.current?.contains(e.relatedTarget as Node)) {
            handleEditComplete();
          }
        }}
        onClick={(e: React.MouseEvent) => {
          setJsonReadOnly(false);
        }}
      >
        <JsonViewer
          ref={JsonViewerRef}
          value={getValueType(value) === 'string' ? value : ''}
          height={120}
          width="100%"
          showSearch={false}
          options={{
            readOnly: jsonReadOnly,
            formatOptions: { tabSize: 4, insertSpaces: true, eol: '\n' },
          }}
          style={{
            padding: 0,
          }}
          onChange={handleJsonChange}
        />
      </JSONViewerWrapper>
    </>
  ) : null;
}
