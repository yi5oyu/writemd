import {
  Flex,
  Card,
  Box,
  CardHeader,
  Heading,
  Text,
  Stack,
  StackDivider,
  CardBody,
  Badge,
  Icon,
  Link,
  Button,
  useClipboard,
} from '@chakra-ui/react'
import { PiGitBranch } from 'react-icons/pi'
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'

const GitInfoBox = ({ isDisabled, selectedFile, repoBranches, githubId }) => {
  if (isDisabled) return

  const repoUrl = `https://github.com/${githubId}/${selectedFile?.repo}`
  const { onCopy, hasCopied } = useClipboard(`${repoUrl}.git`)

  const mainBranch =
    repoBranches.find((b) => b.branch === 'main') || repoBranches.find((b) => b.branch === 'master')

  return (
    <Flex gap="1" overflowY="auto">
      <Card w="100%">
        <CardHeader pb="0">
          <Flex direction="column">
            <Heading size="md" mb="5px">
              <Link
                variant="underline"
                color="blue.500"
                href={repoUrl}
                isExternal={true}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedFile?.repo}
              </Link>
            </Heading>
            <Badge alignSelf="flex-end" display="flex" alignItems="center">
              <Icon as={PiGitBranch} mr="1" />
              {mainBranch ? mainBranch.branch : ''}
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="3">
            {/* 브랜치 목록 */}
            <Box>
              <Heading size="xs" textTransform="uppercase" mb="10px">
                브랜치 ({repoBranches.length}개)
              </Heading>
              <Box maxHeight="150px" overflowY="auto">
                {repoBranches.length > 0 && (
                  <Stack spacing="1" bg="gray.50" py="3px">
                    {[...repoBranches]
                      .sort((a, b) => {
                        if (a.branch === mainBranch?.branch) return -1
                        if (b.branch === mainBranch?.branch) return 1
                        return a.branch.localeCompare(b.branch)
                      })
                      .map((branchItem) => (
                        <Text
                          fontSize="sm"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          lineHeight="24px"
                          key={branchItem.branch}
                          color={branchItem.branch === mainBranch?.branch ? 'blue.600' : 'gray.700'}
                          fontWeight={
                            branchItem.branch === mainBranch?.branch ? 'semibold' : 'normal'
                          }
                        >
                          <Icon as={PiGitBranch} mx="5px" verticalAlign="middle" />
                          {branchItem.branch}
                        </Text>
                      ))}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Clone URL 복사 버튼 */}
            <Box>
              <Heading size="xs" textTransform="uppercase" mb="10px">
                Git Clone
              </Heading>
              <Flex align="center" gap="1">
                <Text
                  fontSize="xs"
                  fontFamily="monospace"
                  bg="gray.50"
                  px="5px"
                  py="1"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="sm"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  title={`${repoUrl}.git`}
                  w="100%"
                >
                  {`${repoUrl}.git`}
                </Text>
                <Button
                  p="0"
                  size="xs"
                  onClick={onCopy}
                  aria-label="깃 클론 복사"
                  bg="transparent"
                  borderRadius="none"
                  color={hasCopied ? 'blue.500' : 'black'}
                  _hover={{ color: 'blue.500' }}
                >
                  <Icon p="0" as={hasCopied ? CheckIcon : CopyIcon} />
                </Button>
              </Flex>
            </Box>

            {/* 외부 링크 */}
            <Box>
              <Heading size="xs" textTransform="uppercase" mb="1">
                링크
              </Heading>
              <Flex mx="2px" gap="2">
                <Link href={`${repoUrl}/issues`} isExternal fontSize="sm" color="blue.500">
                  Issues
                </Link>
                <Link href={`${repoUrl}/pulls`} isExternal fontSize="sm" color="blue.500">
                  Pull requests
                </Link>
                <Link href={`${repoUrl}/actions`} isExternal fontSize="sm" color="blue.500">
                  Actions
                </Link>
              </Flex>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default GitInfoBox
