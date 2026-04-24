import { Button, HStack } from '@chakra-ui/react';
import Link from 'next/link';

type Props = {
  active: 'list' | 'gantt';
};

export function ViewToggle({ active }: Props) {
  return (
    <HStack
      gap={0}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
    >
      <Button
        asChild
        size="sm"
        variant={active === 'list' ? 'solid' : 'ghost'}
        colorPalette={active === 'list' ? 'blue' : undefined}
        borderRadius={0}
      >
        <Link href="/">목록</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant={active === 'gantt' ? 'solid' : 'ghost'}
        colorPalette={active === 'gantt' ? 'blue' : undefined}
        borderRadius={0}
      >
        <Link href="/gantt">간트</Link>
      </Button>
    </HStack>
  );
}
