import type { DatabaseConfig, DatabaseInterface } from '../database-interface';

export class SQLiteDatabase implements DatabaseInterface {
	private config: DatabaseConfig;

	constructor(config: DatabaseConfig) {
		this.config = config;
		// Aquí podrías inicializar la conexión con sqlite3, por ahora es stub
	}

	async guardarInvestigador(datos: any) {
		return { success: false, message: 'Método no implementado en SQLiteDatabase', error: null };
	}

	async obtenerInvestigadores() {
		return [];
	}

	async obtenerInvestigadorPorId(id: number) {
		return null;
	}

	async verificarCredenciales(email: string, password: string) {
		return { success: false, message: 'Método no implementado en SQLiteDatabase' };
	}

	async conectar() {}
	async desconectar() {}
	async inicializar() {}
	async ejecutarMigracion(sql: string) {}
	async consultarInvestigadoresIncompletos() { return []; }
	async obtenerProyectos?() { return []; }
	async obtenerPublicaciones?() { return []; }
	async insertarPublicacion?(datos: any) { return null; }
}
























