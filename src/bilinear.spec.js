import bilinear from './bilinear';


let data = [
  [1, 2, 3, 4],
  [1, 2, 4, 8],
  [1, 3, 9, 27],
];

describe('graph', () => {
  describe('bilinear', () => {
    it('should not make any changes if dX and dY are zeroes', () => {
      let result = bilinear(data, [0, 0, 0], [0, 0]);
      let expected = data;

      expect(result).toEqual(expected);
    });

    it('should interpolate on X by ones', () => {
      let result = bilinear(data, [1, 1, 1], [0, 0]);
      let expected = [
        [1, (1+2)/2, 2, (2+3)/2, 3,  (3+4)/2,  4],
        [1, (1+2)/2, 2, (2+4)/2, 4,  (4+8)/2,  8],
        [1, (1+3)/2, 3, (3+9)/2, 9, (9+27)/2, 27],
      ];
      expect(result).toEqual(expected);
    });

    it('should interpolate on X by twos', () => {
      let result = bilinear(data, [2, 2, 2], [0, 0]);
      let expected = [
        [1, (1+(2-1)/3*1), (1+(2-1)/3*2), 2, (2+(3-2)/3*1), (2+(3-2)/3*2), 3, (3+(4-3)/3*1),  (3+(4-3)/3*2),  4],
        [1, (1+(2-1)/3*1), (1+(2-1)/3*2), 2, (2+(4-2)/3*1), (2+(4-2)/3*2), 4, (4+(8-4)/3*1),  (4+(8-4)/3*2),  8],
        [1, (1+(3-1)/3*1), (1+(3-1)/3*2), 3, (3+(9-3)/3*1), (3+(9-3)/3*2), 9, (9+(27-9)/3*1), (9+(27-9)/3*2), 27],
      ];
      expect(result).toEqual(expected);
    });

    it('should interpolate on X by varying', () => {
      let result = bilinear(data, [1, 3, 2], [0, 0]);
      let expected = [
        [1, (1+(2-1)/2*1), 2, (2+(3-2)/4*1), (2+(3-2)/4*2), (2+(3-2)/4*3), 3, (3+(4-3)/3*1),  (3+(4-3)/3*2),  4],
        [1, (1+(2-1)/2*1), 2, (2+(4-2)/4*1), (2+(4-2)/4*2), (2+(4-2)/4*3), 4, (4+(8-4)/3*1),  (4+(8-4)/3*2),  8],
        [1, (1+(3-1)/2*1), 3, (3+(9-3)/4*1), (3+(9-3)/4*2), (3+(9-3)/4*3), 9, (9+(27-9)/3*1), (9+(27-9)/3*2), 27],
      ];
      expect(result).toEqual(expected);
    });

    it('should interpolate on Y by ones', () => {
      let result = bilinear(data, [0, 0, 0], [1, 1]);
      let expected = [
        [            1,             2,             3,              4],
        [(1+(1-1)/2*1), (2+(2-2)/2*1), (3+(4-3)/2*1),  (4+(8-4)/2*1)],
        [            1,             2,             4,              8],
        [(1+(1-1)/2*1), (2+(3-2)/2*1), (4+(9-4)/2*1), (8+(27-8)/2*1)],
        [            1,             3,             9,             27],
      ];
      expect(result).toEqual(expected);
    });

    it('should interpolate on Y by twos', () => {
      let result = bilinear(data, [0, 0, 0], [2, 2]);
      let expected = [
        [            1,             2,             3,              4],
        [(1+(1-1)/3*1), (2+(2-2)/3*1), (3+(4-3)/3*1),  (4+(8-4)/3*1)],
        [(1+(1-1)/3*2), (2+(2-2)/3*2), (3+(4-3)/3*2),  (4+(8-4)/3*2)],
        [            1,             2,             4,              8],
        [(1+(1-1)/3*1), (2+(3-2)/3*1), (4+(9-4)/3*1), (8+(27-8)/3*1)],
        [(1+(1-1)/3*2), (2+(3-2)/3*2), (4+(9-4)/3*2), (8+(27-8)/3*2)],
        [            1,             3,             9,             27],
      ];
      expect(result).toEqual(expected);
    });

    it('should interpolate on Y by varying', () => {
      let result = bilinear(data, [0, 0, 0], [3, 1]);
      let expected = [
        [            1,             2,             3,              4],
        [(1+(1-1)/4*1), (2+(2-2)/4*1), (3+(4-3)/4*1),  (4+(8-4)/4*1)],
        [(1+(1-1)/4*2), (2+(2-2)/4*2), (3+(4-3)/4*2),  (4+(8-4)/4*2)],
        [(1+(1-1)/4*3), (2+(2-2)/4*3), (3+(4-3)/4*3),  (4+(8-4)/4*3)],
        [            1,             2,             4,              8],
        [(1+(1-1)/2*1), (2+(3-2)/2*1), (4+(9-4)/2*1), (8+(27-8)/2*1)],
        [            1,             3,             9,             27],
      ];
      expect(result).toEqual(expected);
    });

    it('should handle nulls on X', () => {
      let data = [
        [1, 2,    3, 4],
        [1, 2, null, 8],
        [1, 3, null, 27],
      ];
      let result = bilinear(data, [1, 1, 1], [0, 0]);
      let expected = [
        [1, (1+2)/2, 2, (2+3)/2,    3,  (3+4)/2,  4],
        [1, (1+2)/2, 2,    null, null,     null,  8],
        [1, (1+3)/2, 3,    null, null,     null, 27],
      ];
      expect(result).toEqual(expected);
    });

    it('should handle nulls on Y', () => {
      let data = [
        [1, 2,    3,    4],
        [1, 2, null, null],
        [1, 3,    9,   27],
      ];
      let result = bilinear(data, [0, 0, 0], [1, 1]);
      let expected = [
        [            1,             2,    3,    4],
        [(1+(1-1)/2*1), (2+(2-2)/2*1), null, null],
        [            1,             2, null, null],
        [(1+(1-1)/2*1), (2+(3-2)/2*1), null, null],
        [            1,             3,    9,   27],
      ];
      expect(result).toEqual(expected);
    });

  });
});