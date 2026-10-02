import assert from 'node:assert/strict';
import { calcularAvaliacao, calcularIMC, classificarIMC } from './calculations';
import { ClassificacaoIMC, Sexo } from '../types';

assert.equal(calcularIMC(1.75, 70), 22.86);
assert.equal(calcularIMC(0, 70), null);
assert.equal(classificarIMC(18.4), ClassificacaoIMC.AbaixoDoPeso);
assert.equal(classificarIMC(18.5), ClassificacaoIMC.PesoNormal);
assert.equal(classificarIMC(25), ClassificacaoIMC.Sobrepeso);
assert.equal(classificarIMC(30), ClassificacaoIMC.ObesidadeGrau1);
assert.equal(classificarIMC(35), ClassificacaoIMC.ObesidadeGrau2);
assert.equal(classificarIMC(40), ClassificacaoIMC.ObesidadeGrau3);

// Homem 30 anos, soma 7 dobras = 100 mm -> ~ 14,6 % (Pollock 7 + Siri)
const r = calcularAvaliacao({
  altura: 1.8, peso: 80, sexo: Sexo.Masculino, idade: 30,
  dobras: { triceps: 14, peito: 14, axilarMedia: 14, subescapular: 15, abdominal: 15, supraIliaca: 14, coxa: 14 },
});
console.log(r);
assert.ok(r.percentualGordura !== null && r.percentualGordura > 14 && r.percentualGordura < 18);
assert.equal(Math.round(((r.massaGorda ?? 0) + (r.massaMagra ?? 0)) * 100) / 100, 80);
console.log('OK');
