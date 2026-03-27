import React, { useState, useRef, useEffect } from 'react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import {
  Button,
  SideSheet,
  Space,
  Spin,
  Typography,
  Card,
  Tag,
  Avatar,
  Form,
  Row,
  Col,
} from '@douyinfe/semi-ui';
import { IconSave, IconClose, IconUserAdd, IconCopy, IconTickCircle } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const { Text, Title, Paragraph } = Typography;

const QuickAddUserModal = (props) => {
  const { t } = useTranslation();
  const formApiRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [step, setStep] = useState(0); // 0: select plan, 1: show result
  const [result, setResult] = useState(null);
  const isMobile = useIsMobile();

  const loadPlans = async () => {
    try {
      const res = await API.get('/api/subscription/admin/plans');
      const { success, message, data } = res.data;
      if (success) {
        setPlans(
          data.map((item) => ({
            value: item.plan.id,
            label: `${item.plan.title} ($${item.plan.price_amount})`,
          }))
        );
      } else {
        showError(message);
      }
    } catch (err) {
      showError(t('无法加载订阅计划'));
    }
  };

  useEffect(() => {
    if (props.visible) {
      loadPlans();
      setStep(0);
      setResult(null);
    }
  }, [props.visible]);

  const submit = async (values) => {
    setLoading(true);
    try {
      const res = await API.post('/api/user/quick_add_subscription', values);
      const { success, message, data } = res.data;
      if (success) {
        setResult({
          username: data.username,
          password: data.password,
          plan_title: data.plan_title,
          login_url: window.location.origin + '/login',
        });
        setStep(1);
        props.refresh();
      } else {
        showError(message);
      }
    } catch (err) {
      showError(t('请求失败，请重试'));
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `登录地址: ${result.login_url}\n用户名: ${result.username}\n密码: ${result.password}\n订阅套餐: ${result.plan_title}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showSuccess(t('已复制到剪贴板'));
    }).catch(() => {
      showError(t('复制失败'));
    });
  };

  const handleCancel = () => {
    props.handleClose();
  };

  return (
    <SideSheet
      placement={'left'}
      title={
        <Space>
          <Tag color='green' shape='circle'>
            {t('新建')}
          </Tag>
          <Title heading={4} className='m-0'>
            {t('一键添加用户')}
          </Title>
        </Space>
      }
      bodyStyle={{ padding: '0' }}
      visible={props.visible}
      width={isMobile ? '100%' : 600}
      footer={
        <div className='flex justify-end bg-white'>
          <Space>
            {step === 0 && (
              <Button
                theme='solid'
                onClick={() => formApiRef.current?.submitForm()}
                icon={<IconSave />}
                loading={loading}
              >
                {t('一键创建')}
              </Button>
            )}
            {step === 1 && (
              <Button
                theme='solid'
                onClick={handleCopy}
                icon={<IconCopy />}
              >
                {t('一键复制')}
              </Button>
            )}
            <Button
              theme='light'
              type='primary'
              onClick={handleCancel}
              icon={<IconClose />}
            >
              {step === 0 ? t('取消') : t('完成')}
            </Button>
          </Space>
        </div>
      }
      closeIcon={null}
      onCancel={() => handleCancel()}
    >
      <Spin spinning={loading}>
        {step === 0 && (
          <Form
            getFormApi={(api) => (formApiRef.current = api)}
            onSubmit={submit}
            onSubmitFail={(errs) => {
              const first = Object.values(errs)[0];
              if (first) showError(Array.isArray(first) ? first[0] : first);
              formApiRef.current?.scrollToError();
            }}
          >
            <div className='p-2'>
              <Card className='!rounded-2xl shadow-sm border-0'>
                <div className='flex items-center mb-4'>
                  <Avatar size='small' color='blue' className='mr-2 shadow-md'>
                    <IconUserAdd size={16} />
                  </Avatar>
                  <div>
                    <Text className='text-lg font-medium'>{t('一键开通')} (Quick Add)</Text>
                    <div className='text-xs text-gray-600'>
                      {t('自动生成账号密码并绑定订阅包')}
                    </div>
                  </div>
                </div>

                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Select
                      field='plan_id'
                      label={t('选择订阅套餐')}
                      placeholder={t('请选择需要开通的套餐')}
                      optionList={plans}
                      rules={[{ required: true, message: t('请选择需要开通的套餐') }]}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </Card>
            </div>
          </Form>
        )}

        {step === 1 && result && (
          <div className='p-2'>
            <Card className='!rounded-2xl shadow-sm border-0 mb-4'>
              <div className='flex items-center mb-4'>
                <Avatar size='small' color='green' className='mr-2 shadow-md'>
                  <IconTickCircle size={16} />
                </Avatar>
                <div>
                  <Text className='text-lg font-medium'>{t('创建成功')}</Text>
                  <div className='text-xs text-gray-600'>
                    {t('账号已成功创建并绑定该订阅')}
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Paragraph className='mb-2'>
                  <Text strong>{t('登录地址')}:</Text> <Text copyable>{result.login_url}</Text>
                </Paragraph>
                <Paragraph className='mb-2'>
                  <Text strong>{t('用户名')}:</Text> <Text copyable>{result.username}</Text>
                </Paragraph>
                <Paragraph className='mb-2'>
                  <Text strong>{t('密码')}:</Text> <Text copyable>{result.password}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>{t('订阅套餐')}:</Text> <Text>{result.plan_title}</Text>
                </Paragraph>
              </div>
            </Card>
          </div>
        )}
      </Spin>
    </SideSheet>
  );
};

export default QuickAddUserModal;
