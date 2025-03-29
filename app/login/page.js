"use client";

import {useState} from "react";
import {useCreateWallet, useLoginWithEmail} from "@privy-io/react-auth";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { Mail } from 'lucide-react';
import {useRouter} from "next/navigation";

export default function EmailLogin() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const {createWallet} = useCreateWallet({
        onSuccess: ({wallet}) => {
            console.log('created wallet', wallet)
            router.push('/')
        },
        onError: (error) => {
            console.log('error', error)
            if (error === 'embedded_wallet_already_exists') {
                router.push('/')
            }
        }
    })
    const { sendCode, loginWithCode } = useLoginWithEmail({
        onComplete: async (params) => {
            console.log('params', params)
            await createWallet()
        }
    });
    const router = useRouter()
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        setIsCodeSent(true);
        // 开始倒计时
        let timer = countdown;
        const interval = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer <= 0) {
                clearInterval(interval);
                setIsCodeSent(false);
                setCountdown(60);
            }
        }, 1000);

        await sendCode({email})
    };

    // 登录验证
    const handleLogin = async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        if (!code || code.length < 4) {
            alert('请输入有效的验证码');
            return;
        }

        setIsLoading(true);

        // 模拟登录验证
        await loginWithCode({code})
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-full bg-blue-100">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">邮箱验证码登录</CardTitle>
                    <CardDescription className="text-center">
                        请输入您的邮箱地址获取验证码
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div>邮箱地址</div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="请输入邮箱地址"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div>验证码</div>
                        </div>
                        <div className="flex space-x-2">
                            <Input
                                id="code"
                                type="text"
                                placeholder="请输入验证码"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-32"
                                onClick={handleSendCode}
                                disabled={isCodeSent || isLoading}
                            >
                                {isCodeSent ? `${countdown}秒` : '获取验证码'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
