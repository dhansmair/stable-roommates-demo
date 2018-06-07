type Callback = (s: string) => void;

/**
    Utility class for stable roommates
*/
export default class Utils {

    static shuffle(a : Array<any>) : Array<any> {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    static rand(n : number) {
      var result = [];

      for (var i = 0; i < n; i++) {
        var arr = [];
        for (var j = 0; j < n; j++) {
          if (i == j) continue;
          arr.push(j);
        }
         result[i] = Utils.shuffle(arr);
      }

      return result;
    }

    static allDifferent(arr: Array<any>) : boolean {
        for (let i = 0; i < arr.length; i++) {
            if (arr.indexOf(arr[i]) !== i) return false
        }
        return true
    }

    static clone(arr : any) : any {
        return JSON.parse(JSON.stringify(arr))
    }

}
