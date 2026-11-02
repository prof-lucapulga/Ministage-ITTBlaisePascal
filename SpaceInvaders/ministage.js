export default class Ministage {

    static elaboraInput(tastoPremuto) {
        switch (tastoPremuto) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                return { x: -1, y: 0, spara: false }
            case 'ArrowRight':
            case 'd':
            case 'D':
                return { x: 1, y: 0, spara: false }
            case 'ArrowUp':
            case 'w':
            case 'W':
                return { x: 0, y: -1, spara: false }
            case 'ArrowDown':
            case 's':
            case 'S':
                return { x: 0, y: 1, spara: false }
            case ' ':
                return { x: 0, y: 0, spara: true }
            default:
                return { x: 0, y: 0, spara: false }
        }
    }

    static avanzaDiLivello(statistiche) {
        return {
            rateoDiFuoco: statistiche.rateoDiFuoco + 1,
            velocità: statistiche.velocità + 100,
            vitaMassima: statistiche.vitaMassima + 1
        }
    }
}