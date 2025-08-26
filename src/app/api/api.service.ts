import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';

@Injectable()
export class ApiService implements OnModuleInit {
  private paseoApi: ApiPromise | null = null;
  private paseoProvider: WsProvider | null = null;

  async onModuleInit() {
    await this.initApi();
  }

  private async initApi() {
    try {
      if (!this.paseoApi) {
        this.paseoProvider = new WsProvider(process.env.PASEO_RPC_ENDPOINT);

        // Handle WS connection events
        this.paseoProvider.on('connected', () => {
          console.log('🔌 Paseo WS connected');
        });
        this.paseoProvider.on('disconnected', () => {
          console.error('⚠️ Paseo WS disconnected, will try to reconnect...');
        });
        this.paseoProvider.on('error', (err) => {
          console.error('❌ Paseo WS error', err);
        });

        // Wait until WS is ready
        await this.paseoProvider.isReady;

        this.paseoApi = await ApiPromise.create({ provider: this.paseoProvider });
        await this.paseoApi.isReady;

        console.log('✅ Connected to Paseo RPC');
      }
    } catch (error) {
      console.error('❌ Error initializing Paseo API', error.stack);
      throw error;
    }
  }

  async getPaseoApi(): Promise<ApiPromise> {
    if (!this.paseoApi || !this.paseoProvider?.isConnected) {
      console.warn('♻️ Paseo API not ready, reconnecting...');
      this.paseoApi = null;
      await this.initApi();
    }
    return this.paseoApi!;
  }
}
